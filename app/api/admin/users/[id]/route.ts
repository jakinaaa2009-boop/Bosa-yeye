import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { deleteFromR2 } from "@/lib/r2";
import User from "@/models/User";
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

    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Хэрэглэгч олдсонгүй" },
        { status: 404 }
      );
    }

    if (user.role === "admin") {
      return NextResponse.json(
        { success: false, message: "Админ хэрэглэгчийг устгах боломжгүй" },
        { status: 400 }
      );
    }

    const receipts = await Receipt.find({ userId: user._id });
    for (const receipt of receipts) {
      if (receipt.imageKey && !receipt.imageUrl.startsWith("data:")) {
        try {
          await deleteFromR2(receipt.imageKey);
        } catch (error) {
          console.error("R2 delete error:", error);
        }
      }
    }

    const winners = await Winner.find({ userId: user._id });
    for (const winner of winners) {
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

    await Promise.all([
      Receipt.deleteMany({ userId: user._id }),
      Winner.deleteMany({ userId: user._id }),
      User.findByIdAndDelete(user._id),
    ]);

    return NextResponse.json({
      success: true,
      message: "Хэрэглэгч амжилттай устгагдлаа",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { success: false, message: "Хэрэглэгч устгахад алдаа гарлаа" },
      { status: 500 }
    );
  }
}
