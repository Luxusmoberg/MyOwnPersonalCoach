import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/auth";

const publicPaths = ["/login", "/api/auth/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    const authed = await isAuthenticated(request);
    if (authed && pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  const authed = await isAuthenticated(request);
  if (!authed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico|.*\\.svg|.*\\.png).*)"],
};
