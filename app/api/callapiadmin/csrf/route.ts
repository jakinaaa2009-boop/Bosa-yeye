import { NextResponse } from "next/server";
import {
  generateCsrfToken,
  getCallApiAdminSession,
  setCsrfCookie,
} from "@/lib/callapiadmin-auth";
import { isCallApiAdminEnabled, callApiAdminDisabledResponse } from "@/lib/callapiadmin-gate";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isCallApiAdminEnabled()) return callApiAdminDisabledResponse();

  const session = await getCallApiAdminSession(request);
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const token = generateCsrfToken();
  await setCsrfCookie(token);

  return NextResponse.json({ success: true, csrfToken: token });
}
