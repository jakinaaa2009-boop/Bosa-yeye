import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { randomBytes, timingSafeEqual } from "crypto";
import { isCallApiAdminEnabled, getCallApiAdminPasswordHash } from "@/lib/callapiadmin-gate";
import {
  CALLAPIADMIN_SESSION_COOKIE,
  CALLAPIADMIN_CSRF_COOKIE,
  CALLAPIADMIN_CSRF_HEADER,
  SESSION_MAX_AGE,
} from "@/lib/callapiadmin-constants";

export {
  CALLAPIADMIN_SESSION_COOKIE,
  CALLAPIADMIN_CSRF_COOKIE,
  CALLAPIADMIN_CSRF_HEADER,
  SESSION_MAX_AGE,
};

export interface CallApiAdminSession {
  username: string;
}

function getSessionSecret(): Uint8Array {
  const secret =
    process.env.CALLAPIADMIN_SESSION_SECRET?.trim() ||
    process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error("CALLAPIADMIN_SESSION_SECRET or JWT_SECRET is required");
  }
  return new TextEncoder().encode(secret);
}

export async function signCallApiAdminSession(
  username: string
): Promise<string> {
  return new SignJWT({ username, kind: "callapiadmin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSessionSecret());
}

export async function verifyCallApiAdminSession(
  token: string
): Promise<CallApiAdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    if (payload.kind !== "callapiadmin") return null;
    const username = payload.username;
    if (typeof username !== "string" || !username) return null;
    return { username };
  } catch {
    return null;
  }
}

export async function setCallApiAdminSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(CALLAPIADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearCallApiAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(CALLAPIADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
}

export function getSessionTokenFromRequest(
  request: NextRequest
): string | null {
  return request.cookies.get(CALLAPIADMIN_SESSION_COOKIE)?.value ?? null;
}

export async function getCallApiAdminSession(
  request: NextRequest
): Promise<CallApiAdminSession | null> {
  const token = getSessionTokenFromRequest(request);
  if (!token) return null;
  return verifyCallApiAdminSession(token);
}

export async function requireCallApiAdminSession(
  request: NextRequest
): Promise<{ session: CallApiAdminSession } | { error: Response }> {
  if (!isCallApiAdminEnabled()) {
    return {
      error: Response.json({ success: false, message: "Not found" }, { status: 404 }),
    };
  }

  const session = await getCallApiAdminSession(request);
  if (!session) {
    return {
      error: Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  return { session };
}

export async function verifyCallApiAdminPassword(
  password: string
): Promise<boolean> {
  const hash = getCallApiAdminPasswordHash();
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

export function getConfiguredUsername(): string | null {
  const username = process.env.CALLAPIADMIN_USERNAME?.trim();
  return username || null;
}

export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

export async function setCsrfCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(CALLAPIADMIN_CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export function validateCsrf(request: NextRequest): boolean {
  const cookieToken = request.cookies.get(CALLAPIADMIN_CSRF_COOKIE)?.value;
  const headerToken = request.headers.get(CALLAPIADMIN_CSRF_HEADER);

  if (!cookieToken || !headerToken) return false;
  if (cookieToken.length !== headerToken.length) return false;

  try {
    return timingSafeEqual(
      Buffer.from(cookieToken),
      Buffer.from(headerToken)
    );
  } catch {
    return false;
  }
}

export async function requireCallApiAdminWithCsrf(
  request: NextRequest
): Promise<{ session: CallApiAdminSession } | { error: Response }> {
  const authResult = await requireCallApiAdminSession(request);
  if ("error" in authResult) return authResult;

  if (!validateCsrf(request)) {
    return {
      error: Response.json(
        { success: false, message: "Invalid CSRF token" },
        { status: 403 }
      ),
    };
  }

  return authResult;
}
