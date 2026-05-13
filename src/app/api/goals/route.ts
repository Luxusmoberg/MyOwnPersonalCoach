import { NextResponse } from "next/server";
import { getGoals, setGoal } from "@/lib/blob-store";
import { goalSchema } from "@/lib/validators";
import type { Goal } from "@/types/goal";

export async function GET() {
  try {
    const goals = await getGoals();
    return NextResponse.json(goals);
  } catch (error) {
    console.error("Failed to get goals:", error);
    return NextResponse.json({ error: "Failed to load goals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = goalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid goal data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const id = `goal_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const goal: Goal = {
      id,
      ...parsed.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setGoal(id, goal);
    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error("Failed to create goal:", error);
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    );
  }
}
