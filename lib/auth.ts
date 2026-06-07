import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import User, { IUser } from "@/models/User";
import {
  signToken,
  verifyToken,
  COOKIE_NAME,
  COOKIE_MAX_AGE,
  type JWTPayload,
} from "@/lib/jwt";

export type { JWTPayload };
export { signToken, verifyToken };

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAME)?.value ?? null;
}

export async function getCurrentUser(): Promise<IUser | null> {
  const token = await getTokenFromCookies();
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const { connectDB } = await import("@/lib/db");
  await connectDB();
  const user = await User.findById(payload.userId).select("-password");
  return user;
}

export async function requireAuth(
  request: NextRequest
): Promise<{ user: IUser } | { error: Response }> {
  const token = getTokenFromRequest(request);
  if (!token) {
    return {
      error: Response.json(
        { success: false, message: "Нэвтрэх шаардлагатай" },
        { status: 401 }
      ),
    };
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return {
      error: Response.json(
        { success: false, message: "Хүчинтэй бус токен" },
        { status: 401 }
      ),
    };
  }

  const { connectDB } = await import("@/lib/db");
  await connectDB();
  const user = await User.findById(payload.userId).select("-password");
  if (!user) {
    return {
      error: Response.json(
        { success: false, message: "Хэрэглэгч олдсонгүй" },
        { status: 401 }
      ),
    };
  }

  return { user };
}

export async function requireAdmin(
  request: NextRequest
): Promise<{ user: IUser } | { error: Response }> {
  const result = await requireAuth(request);
  if ("error" in result) return result;

  if (result.user.role !== "admin") {
    return {
      error: Response.json(
        { success: false, message: "Админ эрх шаардлагатай" },
        { status: 403 }
      ),
    };
  }

  return result;
}

export function sanitizeUser(user: IUser) {
  const obj = user.toObject ? user.toObject() : user;
  const { password, _id, ...rest } = obj as IUser & {
    password?: string;
    _id?: { toString(): string };
  };
  return {
    id: _id?.toString?.() ?? String(_id),
    ...rest,
  };
}
