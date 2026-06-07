import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Prize from "@/models/Prize";

export async function GET() {
  try {
    await connectDB();
    const prizes = await Prize.find({ isActive: true }).sort({ order: 1 });
    return NextResponse.json({ success: true, prizes });
  } catch (error) {
    console.error("Prizes error:", error);
    return NextResponse.json(
      { success: false, message: "Алдаа гарлаа" },
      { status: 500 }
    );
  }
}
