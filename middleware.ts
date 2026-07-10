import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { isCallApiAdminEnabled } from "@/lib/callapiadmin-gate";

const userProtectedRoutes = ["/upload-receipt", "/my-receipts"];
const adminRoutes = [
  "/admin/dashboard",
  "/admin/users",
  "/admin/receipts",
  "/admin/entries",
  "/admin/winners",
  "/admin/lucky-wheel",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/callapiadmin") ||
    pathname.startsWith("/api/callapiadmin")
  ) {
    if (!isCallApiAdminEnabled()) {
      return new NextResponse(null, { status: 404 });
    }
  }

  const token = request.cookies.get("yeye_token")?.value;
  const payload = token ? await verifyToken(token) : null;

  const isUserProtected = userProtectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoot = pathname === "/admin";

  if (isAdminRoot) {
    if (payload?.role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (isAdminRoute) {
    if (!payload) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (payload.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (isUserProtected && !payload) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isUserProtected && payload?.role === "admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/upload-receipt",
    "/my-receipts",
    "/admin",
    "/admin/dashboard/:path*",
    "/admin/users/:path*",
    "/admin/receipts/:path*",
    "/admin/entries/:path*",
    "/admin/winners/:path*",
    "/admin/lucky-wheel/:path*",
    "/callapiadmin",
    "/callapiadmin/:path*",
    "/api/callapiadmin/:path*",
  ],
};
