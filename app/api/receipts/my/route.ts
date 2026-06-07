import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import Receipt from "@/models/Receipt";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ("error" in authResult) return authResult.error;

    const { user } = authResult;
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = { userId: user._id };
    if (status && status !== "all") {
      filter.status = status;
    }

    const receipts = await Receipt.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, receipts });
  } catch (error) {
    console.error("My receipts error:", error);
    return NextResponse.json(
      { success: false, message: "Алдаа гарлаа" },
      { status: 500 }
    );
  }
}
