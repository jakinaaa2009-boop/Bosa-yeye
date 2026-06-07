import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { validateRejectReason } from "@/lib/validators";
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
    const { rejectionReason } = body;

    const reasonError = validateRejectReason(rejectionReason);
    if (reasonError) {
      return NextResponse.json(
        { success: false, message: reasonError },
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

    if (receipt.status === "rejected") {
      return NextResponse.json(
        { success: false, message: "Баримт аль хэдийн татгалзсан байна" },
        { status: 400 }
      );
    }

    receipt.status = "rejected";
    receipt.rejectedAt = new Date();
    receipt.rejectionReason = rejectionReason || "Баримт буруу байна";
    await receipt.save();

    const populated = await Receipt.findById(receipt._id).populate(
      "userId",
      "phone email"
    );

    return NextResponse.json({
      success: true,
      message: "Баримт татгалзлаа",
      receipt: populated,
    });
  } catch (error) {
    console.error("Reject receipt error:", error);
    return NextResponse.json(
      { success: false, message: "Алдаа гарлаа" },
      { status: 500 }
    );
  }
}
