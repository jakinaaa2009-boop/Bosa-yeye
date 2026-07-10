import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  clearCallApiAdminSessionCookie,
  requireCallApiAdminWithCsrf,
} from "@/lib/callapiadmin-auth";
import { isCallApiAdminEnabled, callApiAdminDisabledResponse } from "@/lib/callapiadmin-gate";
import { logCallApiAdminAction } from "@/lib/callapiadmin-audit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isCallApiAdminEnabled()) return callApiAdminDisabledResponse();

  const authResult = await requireCallApiAdminWithCsrf(request);
  if ("error" in authResult) return authResult.error;

  try {
    await connectDB();
    await logCallApiAdminAction({
      action: "logout",
      adminUsername: authResult.session.username,
    });
  } catch (error) {
    console.error("CallApiAdmin logout audit error:", error);
  }

  await clearCallApiAdminSessionCookie();

  return NextResponse.json({ success: true });
}
