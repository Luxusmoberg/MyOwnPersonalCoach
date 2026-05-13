import { NextResponse } from "next/server";
import { getCheckins, setCheckin, getAppState, setAppState } from "@/lib/blob-store";
import { checkinSchema } from "@/lib/validators";
import { buildCheckinPrompt } from "@/lib/coach/system-prompt";
import { buildChatContext } from "@/lib/coach/context-builder";
import { extractInsights } from "@/lib/coach/insight-extractor";
import { calculateStreak } from "@/lib/streak-calculator";
import { createMessage } from "@/lib/llm-client";
import type { Checkin } from "@/types/checkin";

export async function GET() {
  try {
    const checkins = await getCheckins();
    const sorted = checkins.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(sorted);
  } catch (error) {
    console.error("Failed to get check-ins:", error);
    return NextResponse.json(
      { error: "Failed to load check-ins" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = checkinSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid check-in data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const ctx = await buildChatContext();
    const systemPrompt = buildCheckinPrompt(ctx);

    const userMessage = `Today's check-in:
- What I accomplished: ${parsed.data.accomplishment}
- What was hard: ${parsed.data.challenge}
- One thing for tomorrow: ${parsed.data.tomorrowPlan}
${parsed.data.energyLevel ? `- Energy level: ${parsed.data.energyLevel}/10` : ""}
${parsed.data.focusLevel ? `- Focus level: ${parsed.data.focusLevel}/10` : ""}
${parsed.data.moodRating ? `- Mood: ${parsed.data.moodRating}/10` : ""}`;

    const aiResponse = await createMessage({
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      maxTokens: 1024,
    });

    const id = `checkin_${Date.now()}`;
    const checkin: Checkin = {
      id,
      date: new Date().toISOString(),
      ...parsed.data,
      aiResponse,
      createdAt: new Date().toISOString(),
    };

    await setCheckin(id, checkin);

    // Update streak
    const allCheckins = await getCheckins();
    const { current, longest } = calculateStreak([...allCheckins, checkin]);
    const appState = await getAppState();
    await setAppState({
      ...appState,
      currentStreak: current,
      longestStreak: Math.max(appState.longestStreak, longest),
      lastCheckinDate: new Date().toISOString(),
      lastActiveDate: new Date().toISOString(),
      totalCheckins: appState.totalCheckins + 1,
    });

    // Extract insights asynchronously — don't await, let it run in background
    extractInsights(
      `Check-in from ${new Date().toLocaleDateString()}:\n${userMessage}\n\nCoach response:\n${aiResponse}`,
      id
    ).catch(console.error);

    return NextResponse.json(checkin, { status: 201 });
  } catch (error) {
    console.error("Failed to create check-in:", error);
    return NextResponse.json(
      { error: "Failed to save check-in" },
      { status: 500 }
    );
  }
}
