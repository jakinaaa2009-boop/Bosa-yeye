import { NextRequest, NextResponse } from "next/server";
import {
  getCallApiAdminSession,
  generateCsrfToken,
  setCsrfCookie,
} from "@/lib/callapiadmin-auth";
import { isCallApiAdminEnabled, callApiAdminDisabledResponse } from "@/lib/callapiadmin-gate";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isCallApiAdminEnabled()) return callApiAdminDisabledResponse();

  const session = await getCallApiAdminSession(request);
  if (!session) {
    const csrf = generateCsrfToken();
    await setCsrfCookie(csrf);
    return NextResponse.json({
      success: true,
      authenticated: false,
      csrfToken: csrf,
    });
  }

  const csrf = generateCsrfToken();
  await setCsrfCookie(csrf);

  return NextResponse.json({
    success: true,
    authenticated: true,
    username: session.username,
    csrfToken: csrf,
  });
}
