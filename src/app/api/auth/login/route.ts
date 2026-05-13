import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { getUserByUsername, getUserByEmail } from "@/lib/blob-store";
import { verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const { username, password } = parsed.data;

    // Find user by username or email
    const user =
      (await getUserByUsername(username)) || (await getUserByEmail(username));

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
