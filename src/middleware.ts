import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

// Verify token
async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);

    return payload;
  } catch (error) {
    console.error("JWT verification failed:", error);

    return null;
  }
}

// Detect mobile device
function isMobileUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return false;

  return /android|iphone|ipad|ipod|blackberry|windows phone|mobile/i.test(
    userAgent,
  );
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;

  const { pathname } = req.nextUrl;

  const userAgent = req.headers.get("user-agent");

  // IMPORTANT: await
  const payload = token ? await verifyToken(token) : null;

  const isLoggedIn = !!payload;

  // Protected routes
  if (
    !isLoggedIn &&
    (pathname.startsWith("/administrator") || pathname.startsWith("/me"))
  ) {
    const response = NextResponse.redirect(new URL("/login", req.url));

    response.cookies.delete("accessToken");

    return response;
  }

  // Logged in user visiting login page
  if (isLoggedIn && pathname === "/login") {
    const redirectTo = isMobileUserAgent(userAgent)
      ? "/me/home"
      : "/administrator/dashboard";

    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  // Admin protection
  if (pathname.startsWith("/administrator")) {
    if (payload?.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/me/:path*", "/administrator/:path*"],
};
