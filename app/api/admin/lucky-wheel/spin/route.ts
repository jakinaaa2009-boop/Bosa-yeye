import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ensurePrizePool } from "@/lib/ensure-prizes";
import { buildLotteryTickets } from "@/lib/lottery-entries";
import Receipt from "@/models/Receipt";
import Winner from "@/models/Winner";
import Prize from "@/models/Prize";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if ("error" in authResult) return authResult.error;

    await connectDB();
    await ensurePrizePool();

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

    const approvedReceipts = await Receipt.find({
      status: "approved",
      $expr: {
        $gt: [
          {
            $subtract: [
              { $ifNull: ["$assignedEntries", 0] },
              { $ifNull: ["$usedEntries", 0] },
            ],
          },
          0,
        ],
      },
    }).populate("userId", "phone email");

    const tickets = buildLotteryTickets(approvedReceipts);

    if (tickets.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Сугалаанд оролцох эрхтэй хэрэглэгч олдсонгүй.",
        },
        { status: 400 }
      );
    }

    const randomIndex = Math.floor(Math.random() * tickets.length);
    const selectedTicket = tickets[randomIndex];

    const selectedReceipt = await Receipt.findById(selectedTicket.receiptId);
    if (!selectedReceipt) {
      return NextResponse.json(
        { success: false, message: "Баримт олдсонгүй" },
        { status: 404 }
      );
    }

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
      userId: selectedTicket.userId,
      receiptId: selectedTicket.receiptId,
      receiptNumber: selectedTicket.receiptNumber,
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

    const updatedReceipt = await Receipt.findOneAndUpdate(
      {
        _id: selectedReceipt._id,
        $expr: {
          $gt: [
            {
              $subtract: [
                { $ifNull: ["$assignedEntries", 0] },
                { $ifNull: ["$usedEntries", 0] },
              ],
            },
            0,
          ],
        },
      },
      { $inc: { usedEntries: 1 } },
      { new: true }
    );

    if (!updatedReceipt) {
      await Winner.findByIdAndDelete(winner._id);
      return NextResponse.json(
        {
          success: false,
          message: "Сонгогдсон хэрэглэгчийн эрх дууссан байна. Дахин оролдоно уу.",
        },
        { status: 400 }
      );
    }

    const updatedPrize = await Prize.findOneAndUpdate(
      { _id: prizeId, remainingQuantity: { $gt: 0 } },
      { $inc: { remainingQuantity: -1 } },
      { new: true }
    );

    if (!updatedPrize) {
      await Winner.findByIdAndDelete(winner._id);
      await Receipt.findByIdAndUpdate(selectedReceipt._id, {
        $inc: { usedEntries: -1 },
      });
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
          phone: selectedTicket.phone,
          email: selectedTicket.email,
        },
        receiptIndex: randomIndex,
        totalEligible: tickets.length,
        eligibleReceipts: tickets.map((t) => t.receiptNumber),
        remainingEntries:
          updatedReceipt.assignedEntries - updatedReceipt.usedEntries,
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

    const prizes = await ensurePrizePool();

    const approvedReceipts = await Receipt.find({
      status: "approved",
      $expr: {
        $gt: [
          {
            $subtract: [
              { $ifNull: ["$assignedEntries", 0] },
              { $ifNull: ["$usedEntries", 0] },
            ],
          },
          0,
        ],
      },
    })
      .populate("userId", "phone email")
      .sort({ createdAt: -1 });

    const tickets = buildLotteryTickets(approvedReceipts);

    const totalRemaining = prizes.reduce(
      (sum, p) => sum + p.remainingQuantity,
      0
    );
    const allPrizesExhausted = prizes.length === 0 || totalRemaining === 0;

    return NextResponse.json({
      success: true,
      eligibleReceipts: approvedReceipts,
      eligibleTickets: tickets,
      count: tickets.length,
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
    console.error("Eligible entries error:", error);
    return NextResponse.json(
      { success: false, message: "Алдаа гарлаа" },
      { status: 500 }
    );
  }
}
