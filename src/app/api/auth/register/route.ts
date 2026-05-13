import { NextResponse } from "next/server";
import { createSession, hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { getUserByUsername, getUserByEmail, createUserAccount } from "@/lib/blob-store";
import type { UserAccount } from "@/types/user";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(errors).flat()[0] || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { username, email, password } = parsed.data;

    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const user: UserAccount = {
      id,
      username,
      email,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    await createUserAccount(user);
    await createSession(id);

    return NextResponse.json(
      { success: true, user: { id, username, email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
