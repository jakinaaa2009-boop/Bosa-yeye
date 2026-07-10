import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireCallApiAdminSession } from "@/lib/callapiadmin-auth";
import { isCallApiAdminEnabled, callApiAdminDisabledResponse } from "@/lib/callapiadmin-gate";
import User from "@/models/User";
import Receipt from "@/models/Receipt";
import { getRemainingEntries } from "@/lib/lottery-entries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isCallApiAdminEnabled()) return callApiAdminDisabledResponse();

  const authResult = await requireCallApiAdminSession(request);
  if ("error" in authResult) return authResult.error;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const filter: Record<string, unknown> = { role: "user" };
    if (q) {
      filter.$or = [
        { phone: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("phone email age createdAt")
      .sort({ createdAt: -1 })
      .limit(limit);

    const userIds = users.map((u) => u._id);
    const receipts = await Receipt.find({
      userId: { $in: userIds },
      status: "approved",
    }).select("userId assignedEntries usedEntries status");

    const entriesByUser = new Map<string, number>();
    for (const receipt of receipts) {
      const uid = receipt.userId.toString();
      const remaining = getRemainingEntries(receipt);
      entriesByUser.set(uid, (entriesByUser.get(uid) || 0) + remaining);
    }

    return NextResponse.json({
      success: true,
      users: users.map((u) => ({
        id: u._id.toString(),
        phone: u.phone,
        email: u.email,
        age: u.age,
        remainingEntries: entriesByUser.get(u._id.toString()) || 0,
      })),
    });
  } catch (error) {
    console.error("CallApiAdmin users error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load users" },
      { status: 500 }
    );
  }
}
