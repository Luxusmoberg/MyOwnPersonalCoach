import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const COOKIE_NAME = "lucas-coach-session";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "dev-secret-change-me-in-production"
);

export async function createSession(password: string): Promise<string | null> {
  const accessPassword = process.env.ACCESS_PASSWORD;
  if (!accessPassword || password !== accessPassword) {
    return null;
  }

  const token = await new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  return token;
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;

    const { payload } = await jwtVerify(token, secret);
    return !!payload.authenticated;
  } catch {
    return false;
  }
}

export async function requireAuth(): Promise<boolean> {
  return getSession();
}

// Edge-compatible session check for middleware
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return false;

    const { payload } = await jwtVerify(token, secret);
    return !!payload.authenticated;
  } catch {
    return false;
  }
}
