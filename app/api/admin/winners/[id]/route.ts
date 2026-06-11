import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Winner from "@/models/Winner";
import Prize from "@/models/Prize";
import Receipt from "@/models/Receipt";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin(request);
    if ("error" in authResult) return authResult.error;

    await connectDB();

    const winner = await Winner.findById(params.id);
    if (!winner) {
      return NextResponse.json(
        { success: false, message: "Ялагч олдсонгүй" },
        { status: 404 }
      );
    }

    await Winner.findByIdAndDelete(winner._id);

    if (winner.receiptId) {
      await Receipt.findByIdAndUpdate(winner.receiptId, {
        $inc: { usedEntries: -1 },
      });
    }

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

    return NextResponse.json({
      success: true,
      message: "Ялагч амжилттай устгагдлаа",
    });
  } catch (error) {
    console.error("Delete winner error:", error);
    return NextResponse.json(
      { success: false, message: "Ялагч устгахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}
