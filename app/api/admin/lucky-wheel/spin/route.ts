import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Receipt from "@/models/Receipt";
import Winner from "@/models/Winner";
import Prize from "@/models/Prize";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if ("error" in authResult) return authResult.error;

    await connectDB();

    const body = await request.json();
    const { prizeId } = body;

    if (!prizeId) {
      return NextResponse.json(
        { success: false, message: "Шагнал сонгоно уу" },
        { status: 400 }
      );
    }

    const prize = await Prize.findById(prizeId);
    if (!prize) {
      return NextResponse.json(
        { success: false, message: "Шагнал олдсонгүй." },
        { status: 404 }
      );
    }

    if (!prize.isActive || prize.remainingQuantity <= 0) {
      return NextResponse.json(
        { success: false, message: "Энэ шагналын үлдэгдэл дууссан байна." },
        { status: 400 }
      );
    }

    const wonReceiptIds = await Winner.distinct("receiptId");

    const eligibleReceipts = await Receipt.find({
      status: "approved",
      _id: { $nin: wonReceiptIds },
    }).populate("userId", "phone email");

    if (eligibleReceipts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Сугалаанд оролцох баталгаажсан баримт олдсонгүй.",
        },
        { status: 400 }
      );
    }

    const randomIndex = Math.floor(Math.random() * eligibleReceipts.length);
    const selectedReceipt = eligibleReceipts[randomIndex];
    const user = selectedReceipt.userId as unknown as {
      _id: string;
      phone: string;
      email: string;
    };

    const winnerData: {
      userId: string;
      receiptId: string;
      receiptNumber: string;
      prizeId: string;
      prizeName: string;
      prizeType: "car" | "cash";
      prizeAmount?: number;
      carModel?: string;
      drawDate: Date;
    } = {
      userId: user._id,
      receiptId: selectedReceipt._id.toString(),
      receiptNumber: selectedReceipt.receiptNumber,
      prizeId: prize._id.toString(),
      prizeName: prize.name,
      prizeType: prize.type,
      drawDate: new Date(),
    };

    if (prize.type === "car") {
      winnerData.carModel = prize.carModel || "BAIC X55";
    } else {
      winnerData.prizeAmount = prize.amount;
    }

    const winner = await Winner.create(winnerData);

    const updatedPrize = await Prize.findOneAndUpdate(
      { _id: prizeId, remainingQuantity: { $gt: 0 } },
      { $inc: { remainingQuantity: -1 } },
      { new: true }
    );

    if (!updatedPrize) {
      await Winner.findByIdAndDelete(winner._id);
      return NextResponse.json(
        { success: false, message: "Энэ шагналын үлдэгдэл дууссан байна." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      winner: {
        _id: winner._id,
        receiptNumber: winner.receiptNumber,
        prizeName: winner.prizeName,
        prizeType: winner.prizeType,
        prizeAmount: winner.prizeAmount,
        carModel: winner.carModel,
        drawDate: winner.drawDate,
        user: {
          phone: user.phone,
          email: user.email,
        },
        receiptIndex: randomIndex,
        totalEligible: eligibleReceipts.length,
        eligibleReceipts: eligibleReceipts.map((r) => r.receiptNumber),
        prizeRemaining: updatedPrize.remainingQuantity,
      },
    });
  } catch (error) {
    console.error("Lucky wheel spin error:", error);
    return NextResponse.json(
      { success: false, message: "Сугалаа амжилтгүй боллоо" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if ("error" in authResult) return authResult.error;

    await connectDB();

    const wonReceiptIds = await Winner.distinct("receiptId");

    const eligibleReceipts = await Receipt.find({
      status: "approved",
      _id: { $nin: wonReceiptIds },
    })
      .populate("userId", "phone email")
      .sort({ createdAt: -1 });

    const prizes = await Prize.find({ isActive: true }).sort({ order: 1 });

    const totalRemaining = prizes.reduce(
      (sum, p) => sum + p.remainingQuantity,
      0
    );
    const allPrizesExhausted = totalRemaining === 0;

    return NextResponse.json({
      success: true,
      eligibleReceipts,
      count: eligibleReceipts.length,
      prizes: prizes.map((p) => ({
        _id: p._id,
        name: p.name,
        type: p.type,
        amount: p.amount,
        carModel: p.carModel,
        quantity: p.quantity,
        remainingQuantity: p.remainingQuantity,
        isActive: p.isActive,
        order: p.order,
      })),
      allPrizesExhausted,
    });
  } catch (error) {
    console.error("Eligible receipts error:", error);
    return NextResponse.json(
      { success: false, message: "Алдаа гарлаа" },
      { status: 500 }
    );
  }
}
