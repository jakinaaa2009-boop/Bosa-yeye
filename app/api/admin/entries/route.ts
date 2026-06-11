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

    const filter: Record<string, unknown> = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const receipts = await Receipt.find(filter)
      .populate("userId", "phone email")
      .sort({ createdAt: -1 })
      .limit(100);

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

    const totalAssigned = rows.reduce((sum, r) => sum + r.assignedEntries, 0);
    const totalUsed = rows.reduce((sum, r) => sum + r.usedEntries, 0);
    const totalRemaining = rows.reduce((sum, r) => sum + r.remainingEntries, 0);

    return NextResponse.json({
      success: true,
      entries: rows,
      summary: {
        totalAssigned,
        totalUsed,
        totalRemaining,
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
