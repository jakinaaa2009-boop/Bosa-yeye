import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { validateAssignedEntries, parsePositiveEntryCount } from "@/lib/lottery-entries";
import Receipt from "@/models/Receipt";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin(request);
    if ("error" in authResult) return authResult.error;

    await connectDB();

    const body = await request.json().catch(() => ({}));
    const parsed = parsePositiveEntryCount(body.assignedEntries ?? 1);
    if (!parsed.valid) {
      return NextResponse.json(
        { success: false, message: parsed.message },
        { status: 400 }
      );
    }

    const assignedEntries = parsed.value;
    const entryValidation = validateAssignedEntries(assignedEntries, 0, {
      requirePositive: true,
    });
    if (!entryValidation.valid) {
      return NextResponse.json(
        { success: false, message: entryValidation.message },
        { status: 400 }
      );
    }

    const receipt = await Receipt.findById(params.id);
    if (!receipt) {
      return NextResponse.json(
        { success: false, message: "Баримт олдсонгүй" },
        { status: 404 }
      );
    }

    if (receipt.status === "approved") {
      return NextResponse.json(
        { success: false, message: "Баримт аль хэдийн баталгаажсан байна" },
        { status: 400 }
      );
    }

    receipt.status = "approved";
    receipt.assignedEntries = assignedEntries;
    receipt.usedEntries = 0;
    receipt.approvedAt = new Date();
    receipt.rejectionReason = undefined;
    await receipt.save();

    const populated = await Receipt.findById(receipt._id).populate(
      "userId",
      "phone email"
    );

    return NextResponse.json({
      success: true,
      message: "Баримт амжилттай баталгаажлаа",
      receipt: populated,
    });
  } catch (error) {
    console.error("Approve receipt error:", error);
    return NextResponse.json(
      { success: false, message: "Алдаа гарлаа" },
      { status: 500 }
    );
  }
}
