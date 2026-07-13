import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getRemainingEntries } from "@/lib/lottery-entries";
import Receipt from "@/models/Receipt";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if ("error" in authResult) return authResult.error;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20)
    );
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const [receipts, total, statusAgg] = await Promise.all([
      Receipt.find(filter)
        .populate("userId", "phone email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Receipt.countDocuments(filter),
      Receipt.aggregate<{
        _id: string | null;
        count: number;
        totalAssigned: number;
        totalUsed: number;
      }>([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAssigned: { $sum: { $ifNull: ["$assignedEntries", 0] } },
            totalUsed: { $sum: { $ifNull: ["$usedEntries", 0] } },
          },
        },
      ]),
    ]);

    const emptyTab = {
      count: 0,
      totalAssigned: 0,
      totalUsed: 0,
      totalRemaining: 0,
    };

    const tabs = {
      all: { ...emptyTab },
      approved: { ...emptyTab },
      pending: { ...emptyTab },
      rejected: { ...emptyTab },
    };

    for (const row of statusAgg) {
      const key = row._id as keyof typeof tabs;
      if (!key || !(key in tabs) || key === "all") continue;

      const totalRemaining = Math.max(0, row.totalAssigned - row.totalUsed);
      tabs[key] = {
        count: row.count,
        totalAssigned: row.totalAssigned,
        totalUsed: row.totalUsed,
        totalRemaining,
      };

      tabs.all.count += row.count;
      tabs.all.totalAssigned += row.totalAssigned;
      tabs.all.totalUsed += row.totalUsed;
      tabs.all.totalRemaining += totalRemaining;
    }

    const activeTab =
      status && status !== "all" && status in tabs
        ? tabs[status as keyof typeof tabs]
        : tabs.all;

    const rows = receipts.map((receipt) => {
      const user = receipt.userId as unknown as {
        phone: string;
        email: string;
      } | null;

      return {
        _id: receipt._id,
        receiptNumber: receipt.receiptNumber,
        amount: receipt.amount,
        status: receipt.status,
        assignedEntries: receipt.assignedEntries ?? 0,
        usedEntries: receipt.usedEntries ?? 0,
        remainingEntries: getRemainingEntries(receipt),
        createdAt: receipt.createdAt,
        userId: user
          ? { phone: user.phone, email: user.email }
          : { phone: "-", email: "-" },
      };
    });

    return NextResponse.json({
      success: true,
      entries: rows,
      summary: {
        totalAssigned: activeTab.totalAssigned,
        totalUsed: activeTab.totalUsed,
        totalRemaining: activeTab.totalRemaining,
      },
      tabs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 0,
      },
    });
  } catch (error) {
    console.error("Admin entries error:", error);
    return NextResponse.json(
      { success: false, message: "Алдаа гарлаа" },
      { status: 500 }
    );
  }
}
