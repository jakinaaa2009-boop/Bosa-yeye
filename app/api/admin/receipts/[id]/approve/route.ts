import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
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
