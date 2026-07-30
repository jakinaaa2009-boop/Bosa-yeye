import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Winner from "@/models/Winner";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limitRaw = parseInt(searchParams.get("limit") || "", 10);
    const limit =
      Number.isFinite(limitRaw) && limitRaw > 0
        ? Math.min(limitRaw, 200)
        : undefined;

    let query = Winner.find()
      .populate("userId", "phone email")
      .sort({ drawDate: -1 });

    if (limit) {
      query = query.limit(limit);
    }

    const winners = await query;

    const formatted = winners.map((w) => {
      const user = w.userId as unknown as { phone: string; email: string };
      return {
        _id: w._id,
        receiptNumber: w.receiptNumber,
        prizeName: w.prizeName,
        prizeType: w.prizeType,
        prizeAmount: w.prizeAmount,
        carModel: w.carModel,
        drawDate: w.drawDate,
        phone: user?.phone || "",
        email: user?.email || "",
      };
    });

    return NextResponse.json(
      { success: true, winners: formatted },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Winners error:", error);
    return NextResponse.json(
      { success: false, message: "Алдаа гарлаа" },
      { status: 500 }
    );
  }
}
