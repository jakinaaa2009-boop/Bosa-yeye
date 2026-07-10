import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireCallApiAdminWithCsrf, requireCallApiAdminSession } from "@/lib/callapiadmin-auth";
import { isCallApiAdminEnabled, callApiAdminDisabledResponse } from "@/lib/callapiadmin-gate";
import {
  getActiveOverride,
  setActiveOverride,
  clearActiveOverride,
} from "@/lib/callapiadmin-override";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isCallApiAdminEnabled()) return callApiAdminDisabledResponse();

  const authResult = await requireCallApiAdminSession(request);
  if ("error" in authResult) return authResult.error;

  try {
    await connectDB();
    const override = await getActiveOverride();

    if (!override) {
      return NextResponse.json({ success: true, override: null });
    }

    return NextResponse.json({
      success: true,
      override: {
        userId: override.userId.toString(),
        userPhone: override.userPhone,
        userEmail: override.userEmail,
        keepActive: override.keepActive,
        setByUsername: override.setByUsername,
        createdAt: override.createdAt,
      },
    });
  } catch (error) {
    console.error("CallApiAdmin override GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load override" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isCallApiAdminEnabled()) return callApiAdminDisabledResponse();

  const authResult = await requireCallApiAdminWithCsrf(request);
  if ("error" in authResult) return authResult.error;

  try {
    await connectDB();

    const body = await request.json();
    const { userId, keepActive = false } = body as {
      userId?: string;
      keepActive?: boolean;
    };

    if (!userId?.trim()) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ _id: userId, role: "user" }).select(
      "phone email"
    );
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Test user not found" },
        { status: 404 }
      );
    }

    const override = await setActiveOverride({
      userId: user._id.toString(),
      userPhone: user.phone,
      userEmail: user.email,
      keepActive: Boolean(keepActive),
      setByUsername: authResult.session.username,
    });

    return NextResponse.json({
      success: true,
      override: {
        userId: override.userId.toString(),
        userPhone: override.userPhone,
        userEmail: override.userEmail,
        keepActive: override.keepActive,
        setByUsername: override.setByUsername,
        createdAt: override.createdAt,
      },
    });
  } catch (error) {
    console.error("CallApiAdmin override POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to set override" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!isCallApiAdminEnabled()) return callApiAdminDisabledResponse();

  const authResult = await requireCallApiAdminWithCsrf(request);
  if ("error" in authResult) return authResult.error;

  try {
    await connectDB();
    await clearActiveOverride(authResult.session.username);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CallApiAdmin override DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to clear override" },
      { status: 500 }
    );
  }
}
