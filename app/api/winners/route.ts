import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Winner from "@/models/Winner";

export async function GET() {
  try {
    await connectDB();

    const winners = await Winner.find()
      .populate("userId", "phone email")
      .sort({ drawDate: -1 });

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

    return NextResponse.json({ success: true, winners: formatted });
  } catch (error) {
    console.error("Winners error:", error);
    return NextResponse.json(
      { success: false, message: "Алдаа гарлаа" },
      { status: 500 }
    );
  }
}
