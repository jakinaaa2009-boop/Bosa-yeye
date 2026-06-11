import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { deleteFromR2 } from "@/lib/r2";
import Receipt from "@/models/Receipt";
import Winner from "@/models/Winner";
import Prize from "@/models/Prize";

export const dynamic = "force-dynamic";

export async function DELETE(
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

    const winner = await Winner.findOne({ receiptId: receipt._id });
    if (winner) {
      await Winner.findByIdAndDelete(winner._id);
      if (winner.prizeId) {
        await Prize.findByIdAndUpdate(winner.prizeId, [
          {
            $set: {
              remainingQuantity: {
                $min: ["$quantity", { $add: ["$remainingQuantity", 1] }],
              },
            },
          },
        ]);
      }
    }

    if (receipt.imageKey && !receipt.imageUrl.startsWith("data:")) {
      try {
        await deleteFromR2(receipt.imageKey);
      } catch (error) {
        console.error("R2 delete error:", error);
      }
    }

    await Receipt.findByIdAndDelete(receipt._id);

    return NextResponse.json({
      success: true,
      message: "Баримт амжилттай устгагдлаа",
    });
  } catch (error) {
    console.error("Delete receipt error:", error);
    return NextResponse.json(
      { success: false, message: "Баримт устгахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}
