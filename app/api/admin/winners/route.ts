import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Winner from "@/models/Winner";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if ("error" in authResult) return authResult.error;

    await connectDB();

    const winners = await Winner.find()
      .populate("userId", "phone email")
      .sort({ drawDate: -1 });

    return NextResponse.json({ success: true, winners });
  } catch (error) {
    console.error("Admin winners error:", error);
    return NextResponse.json(
      { success: false, message: "Алдаа гарлаа" },
      { status: 500 }
    );
  }
}
