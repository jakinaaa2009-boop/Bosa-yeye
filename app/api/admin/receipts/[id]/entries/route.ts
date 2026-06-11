import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { validateAssignedEntries } from "@/lib/lottery-entries";
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

    const body = await request.json();
    const assignedEntries = Number(body.assignedEntries);

    const receipt = await Receipt.findById(params.id);
    if (!receipt) {
      return NextResponse.json(
        { success: false, message: "Баримт олдсонгүй" },
        { status: 404 }
      );
    }

    if (receipt.status !== "approved") {
      return NextResponse.json(
        {
          success: false,
          message: "Зөвхөн баталгаажсан баримтад эрх олгоно",
        },
        { status: 400 }
      );
    }

    const entryValidation = validateAssignedEntries(
      assignedEntries,
      receipt.usedEntries ?? 0
    );
    if (!entryValidation.valid) {
      return NextResponse.json(
        { success: false, message: entryValidation.message },
        { status: 400 }
      );
    }

    receipt.assignedEntries = assignedEntries;
    await receipt.save();

    const populated = await Receipt.findById(receipt._id).populate(
      "userId",
      "phone email"
    );

    return NextResponse.json({
      success: true,
      message: "Сугалааны эрх амжилттай шинэчлэгдлээ",
      receipt: populated,
    });
  } catch (error) {
    console.error("Update entries error:", error);
    return NextResponse.json(
      { success: false, message: "Эрх шинэчлэхэд алдаа гарлаа" },
      { status: 500 }
    );
  }
}
