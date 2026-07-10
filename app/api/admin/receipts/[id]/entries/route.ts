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

    const { user: admin } = authResult;
    await connectDB();

    const body = await request.json();
    const parsed = parsePositiveEntryCount(body.assignedEntries);
    if (!parsed.valid) {
      return NextResponse.json(
        { success: false, message: parsed.message },
        { status: 400 }
      );
    }

    const assignedEntries = parsed.value;

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
          message: "Зөвхөн баталгаажсан баримтын эрхийг засна",
        },
        { status: 400 }
      );
    }

    const usedEntries = receipt.usedEntries ?? 0;
    const entryValidation = validateAssignedEntries(
      assignedEntries,
      usedEntries,
      { requirePositive: true }
    );
    if (!entryValidation.valid) {
      return NextResponse.json(
        { success: false, message: entryValidation.message },
        { status: 400 }
      );
    }

    if (receipt.assignedEntries === assignedEntries) {
      const populated = await Receipt.findById(receipt._id).populate(
        "userId",
        "phone email"
      );
      return NextResponse.json({
        success: true,
        message: "Эрхийн тоо өөрчлөгдөөгүй байна",
        receipt: populated,
      });
    }

    receipt.assignedEntries = assignedEntries;
    receipt.entriesUpdatedAt = new Date();
    receipt.entriesUpdatedBy = admin.phone || admin.email;
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
