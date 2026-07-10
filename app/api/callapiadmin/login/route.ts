import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  getConfiguredUsername,
  setCallApiAdminSessionCookie,
  signCallApiAdminSession,
  verifyCallApiAdminPassword,
  generateCsrfToken,
  setCsrfCookie,
  CALLAPIADMIN_CSRF_HEADER,
} from "@/lib/callapiadmin-auth";
import { CALLAPIADMIN_CSRF_COOKIE } from "@/lib/callapiadmin-constants";
import { isCallApiAdminEnabled, callApiAdminDisabledResponse } from "@/lib/callapiadmin-gate";
import {
  checkLoginRateLimit,
  recordLoginFailure,
  clearLoginRateLimit,
  getRateLimitKey,
} from "@/lib/callapiadmin-rate-limit";
import { logCallApiAdminAction } from "@/lib/callapiadmin-audit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isCallApiAdminEnabled()) return callApiAdminDisabledResponse();

  const rateKey = getRateLimitKey(request);
  const rateCheck = checkLoginRateLimit(rateKey);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: `Too many login attempts. Retry in ${rateCheck.retryAfterSeconds}s.`,
      },
      { status: 429 }
    );
  }

  try {
    await connectDB();

    const body = await request.json();
    const { username, password, csrfToken } = body as {
      username?: string;
      password?: string;
      csrfToken?: string;
    };

    const headerToken = request.headers.get(CALLAPIADMIN_CSRF_HEADER);
    const cookieToken = request.cookies.get(CALLAPIADMIN_CSRF_COOKIE)?.value;
    const csrfValue = csrfToken || headerToken;

    if (!csrfValue || !cookieToken || csrfValue !== cookieToken) {
      return NextResponse.json(
        { success: false, message: "Invalid CSRF token" },
        { status: 403 }
      );
    }

    if (!username?.trim() || !password) {
      return NextResponse.json(
        { success: false, message: "Username and password are required" },
        { status: 400 }
      );
    }

    const expectedUsername = getConfiguredUsername();
    if (!expectedUsername || username.trim() !== expectedUsername) {
      recordLoginFailure(rateKey);
      await logCallApiAdminAction({
        action: "login_failed",
        adminUsername: username.trim(),
        metadata: { reason: "invalid_credentials" },
      });
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const passwordValid = await verifyCallApiAdminPassword(password);
    if (!passwordValid) {
      recordLoginFailure(rateKey);
      await logCallApiAdminAction({
        action: "login_failed",
        adminUsername: username.trim(),
        metadata: { reason: "invalid_credentials" },
      });
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    clearLoginRateLimit(rateKey);

    const token = await signCallApiAdminSession(expectedUsername);
    await setCallApiAdminSessionCookie(token);

    const newCsrf = generateCsrfToken();
    await setCsrfCookie(newCsrf);

    await logCallApiAdminAction({
      action: "login_success",
      adminUsername: expectedUsername,
    });

    return NextResponse.json({
      success: true,
      username: expectedUsername,
      csrfToken: newCsrf,
    });
  } catch (error) {
    console.error("CallApiAdmin login error:", error);
    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    );
  }
}
