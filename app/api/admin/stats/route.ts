import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ensurePrizePool } from "@/lib/ensure-prizes";
import User from "@/models/User";
import Receipt from "@/models/Receipt";
import Winner from "@/models/Winner";
import { PRIZE_POOL_TOTAL } from "@/lib/prize-pool";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if ("error" in authResult) return authResult.error;

    await connectDB();

    const [
      totalUsers,
      totalReceipts,
      pendingReceipts,
      approvedReceipts,
      rejectedReceipts,
      totalWinners,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Receipt.countDocuments(),
      Receipt.countDocuments({ status: "pending" }),
      Receipt.countDocuments({ status: "approved" }),
      Receipt.countDocuments({ status: "rejected" }),
      Winner.countDocuments(),
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const receiptsByDay = await Receipt.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const statusBreakdown = [
      { name: "Хүлээгдэж буй", value: pendingReceipts, color: "#FACC15" },
      { name: "Баталгаажсан", value: approvedReceipts, color: "#22C55E" },
      { name: "Татгалзсан", value: rejectedReceipts, color: "#EF4444" },
    ];

    const prizes = await ensurePrizePool();
    const totalRemaining = prizes.reduce(
      (sum, p) => sum + p.remainingQuantity,
      0
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalReceipts,
        pendingReceipts,
        approvedReceipts,
        rejectedReceipts,
        totalWinners,
      },
      prizePool: {
        totalWinnersCap: PRIZE_POOL_TOTAL.totalWinners,
        totalRemaining,
        prizes: prizes.map((p) => ({
          _id: p._id,
          name: p.name,
          type: p.type,
          amount: p.amount,
          carModel: p.carModel,
          quantity: p.quantity,
          remainingQuantity: p.remainingQuantity,
        })),
      },
      receiptsByDay: receiptsByDay.map((d) => ({
        date: d._id,
        count: d.count,
      })),
      statusBreakdown,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { success: false, message: "Алдаа гарлаа" },
      { status: 500 }
    );
  }
}
