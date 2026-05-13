import { createMessage } from "@/lib/llm-client";
import { buildInsightExtractionPrompt } from "@/lib/coach/system-prompt";
import {
  getProfile,
  setProfile,
  getMemories,
  setMemory,
} from "@/lib/blob-store";
import type { CoachMemory } from "@/types/memory";

export async function extractInsights(
  interactionText: string,
  source: string
): Promise<CoachMemory[]> {
  const systemPrompt = buildInsightExtractionPrompt();

  try {
    const text = await createMessage(
      {
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Here is the interaction with Lucas:\n\n${interactionText.slice(0, 4000)}`,
          },
        ],
        maxTokens: 1024,
      },
      "cheap"
    );

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const insights = JSON.parse(jsonMatch[0]) as {
      type: CoachMemory["type"];
      content: string;
      confidence: number;
    }[];

    const saved: CoachMemory[] = [];
    for (const insight of insights) {
      if (insight.confidence > 0.6) {
        const memory: CoachMemory = {
          id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          type: insight.type,
          content: insight.content,
          source,
          confidence: insight.confidence,
          createdAt: new Date().toISOString(),
        };
        await setMemory(memory.id, memory);
        saved.push(memory);
      }
    }

    return saved;
  } catch (error) {
    console.error("Insight extraction failed:", error);
    return [];
  }
}

export async function evaluateProfile(): Promise<void> {
  const profile = await getProfile();
  if (!profile) return;

  const memories = await getMemories();
  const recentMemories = memories
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 30);

  if (recentMemories.length === 0) return;

  try {
    const text = await createMessage(
      {
        system: `You are evaluating Lucas's coach profile. Based on recent insights and memories about him, suggest any updates to his communication preferences or motivations. Only suggest changes if there's clear evidence from the data. Return JSON.`,
        messages: [
          {
            role: "user",
            content: `Current profile: ${JSON.stringify(profile)}\n\nRecent memories: ${JSON.stringify(recentMemories)}\n\nAnalyze whether any profile fields should be updated. Return: {"communicationStyle": "...", "motivationalStyle": "...", "verbosity": "...", "accountabilityPreference": "...", "whatMotivates": [...], "burnoutSignals": [...], "changes": "explanation of what changed and why"}`,
          },
        ],
        maxTokens: 512,
      },
      "fast"
    );

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return;

    const updates = JSON.parse(jsonMatch[0]);
    const updated = {
      ...profile,
      communicationStyle: updates.communicationStyle || profile.communicationStyle,
      motivationalStyle: updates.motivationalStyle || profile.motivationalStyle,
      verbosity: updates.verbosity || profile.verbosity,
      accountabilityPreference: updates.accountabilityPreference || profile.accountabilityPreference,
      whatMotivates: updates.whatMotivates || profile.whatMotivates,
      burnoutSignals: updates.burnoutSignals || profile.burnoutSignals,
      updatedAt: new Date().toISOString(),
    };

    await setProfile(updated);
  } catch (error) {
    console.error("Profile evaluation failed:", error);
  }
}
