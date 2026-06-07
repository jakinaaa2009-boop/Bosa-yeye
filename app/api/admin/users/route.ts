import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import User from "@/models/User";
import Receipt from "@/models/Receipt";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if ("error" in authResult) return authResult.error;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "10"));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { role: "user" };
    if (search) {
      filter.$or = [
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const receiptCount = await Receipt.countDocuments({ userId: user._id });
        return {
          _id: user._id,
          phone: user.phone,
          email: user.email,
          age: user.age,
          receiptCount,
          createdAt: user.createdAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      users: usersWithCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json(
      { success: false, message: "Алдаа гарлаа" },
      { status: 500 }
    );
  }
}
