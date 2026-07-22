import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { escapeRegex, startOfDayUlaanbaatar, endOfDayUlaanbaatar } from "@/lib/utils";
import Receipt from "@/models/Receipt";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if ("error" in authResult) return authResult.error;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim() ?? "";
    const dateFromRaw = searchParams.get("dateFrom")?.trim() ?? "";
    const dateToRaw = searchParams.get("dateTo")?.trim() ?? "";
    const dateFrom = startOfDayUlaanbaatar(dateFromRaw);
    const dateTo = endOfDayUlaanbaatar(dateToRaw);
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

    if (search) {
      const pattern = escapeRegex(search);
      const orFilters: Record<string, unknown>[] = [
        { receiptNumber: { $regex: pattern, $options: "i" } },
      ];

      const matchingUsers = await User.find({
        $or: [
          { phone: { $regex: pattern, $options: "i" } },
          { email: { $regex: pattern, $options: "i" } },
        ],
      })
        .select("_id")
        .limit(50);

      if (matchingUsers.length > 0) {
        orFilters.push({
          userId: { $in: matchingUsers.map((user) => user._id) },
        });
      }

      filter.$or = orFilters;
    }

    if (dateFrom || dateTo) {
      const createdAt: Record<string, Date> = {};
      if (dateFrom) createdAt.$gte = dateFrom;
      if (dateTo) createdAt.$lte = dateTo;
      filter.createdAt = createdAt;
    }

    const [receipts, total, exactMatch] = await Promise.all([
      Receipt.find(filter)
        .populate("userId", "phone email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Receipt.countDocuments(filter),
      search
        ? Receipt.findOne({
            receiptNumber: {
              $regex: new RegExp(`^${escapeRegex(search)}$`, "i"),
            },
          })
            .populate("userId", "phone email")
            .select("receiptNumber status createdAt userId")
        : null,
    ]);

    const exactReceiptMatch = exactMatch
      ? {
          receiptNumber: exactMatch.receiptNumber,
          status: exactMatch.status,
          createdAt: exactMatch.createdAt,
          user: exactMatch.userId as unknown as {
            phone: string;
            email: string;
          } | null,
        }
      : null;

    return NextResponse.json({
      success: true,
      receipts,
      search: search || null,
      dateFrom: dateFromRaw || null,
      dateTo: dateToRaw || null,
      exactReceiptMatch,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 0,
      },
    });
  } catch (error) {
    console.error("Admin receipts error:", error);
    return NextResponse.json(
      { success: false, message: "Алдаа гарлаа" },
      { status: 500 }
    );
  }
}
