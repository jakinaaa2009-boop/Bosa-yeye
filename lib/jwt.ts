import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "yeye_token";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface JWTPayload {
  userId: string;
  role: "user" | "admin";
}

function getSecret() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET || "fallback-secret"
  );
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ userId: payload.userId, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const userId = payload.userId;
    const role = payload.role;

    if (typeof userId !== "string" || (role !== "user" && role !== "admin")) {
      return null;
    }

    return { userId, role };
  } catch {
    return null;
  }
}
