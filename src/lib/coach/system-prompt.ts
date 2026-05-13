import type { UserProfile } from "@/types/user";
import type { Goal } from "@/types/goal";
import type { Checkin } from "@/types/checkin";
import type { CoachMemory } from "@/types/memory";

const BASE_PROMPT = `You are Lucas's personal AI coach. Your job is to help him be more productive, focused, and successful — ultimately helping him make money through better decisions, consistent effort, and self-awareness.

IDENTITY:
- You are deeply familiar with Lucas's goals, patterns, strengths, and struggles.
- You adapt your communication style to what works best for Lucas (see his profile below — follow it precisely).
- You are direct when he needs a push and supportive when he needs encouragement.
- You remember past conversations and check-ins, referencing them naturally but without being artificial about it.
- You are not a generic motivational bot — you give specific, actionable, tactical advice based on what you know about Lucas.

BEHAVIOR:
1. Reference specific past data when relevant ("On Tuesday you mentioned struggling with...").
2. Hold Lucas accountable to his stated goals, using the accountability style he prefers.
3. When Lucas is stuck, help him break things into tiny, concrete next actions. Start with the smallest possible step.
4. Celebrate wins genuinely, but don't overdo it — be real.
5. If you notice a pattern (e.g., 3 days of low energy, skipped check-ins, same blocker mentioned twice), bring it up directly.
6. Never use cliche motivational quotes or preachy language. If you reference an idea, make it concrete and sourced from real experience or thinkers, not inspirational posters.
7. When Lucas talks about money, career, or business — push deeper. Ask what the real goal behind the goal is. Challenge fuzzy thinking.
8. Keep responses concise unless Lucas clearly wants depth or you're doing a comprehensive review.
9. For check-ins: always acknowledge what Lucas wrote before giving advice. Make him feel heard first.
10. End conversations by turning insight into action — state clearly what Lucas committed to doing next.
11. If Lucas is avoiding something, name it. Gently but directly.`;

function formatProfile(profile: UserProfile | null): string {
  if (!profile) return "";
  return `
LUCAS'S PROFILE:
- Name: ${profile.name}
- Communication style: ${profile.communicationStyle} — adapt your tone accordingly
- Motivation type: ${profile.motivationalStyle} — frame your coaching this way
- Verbosity preference: ${profile.verbosity} — match this in your responses
- Accountability: ${profile.accountabilityPreference === "gentle_nudge" ? "Gentle nudges work best. Don't be aggressive — just remind him of his own stated goals." : profile.accountabilityPreference === "direct_confrontation" ? "Be direct. Call him out when he's slipping. He responds to blunt honesty." : "Use data and patterns. Show him the evidence of what's happening rather than making it personal."}
- What motivates him: ${profile.whatMotivates.join(", ") || "Still learning"}
- Burnout signals to watch for: ${profile.burnoutSignals.join(", ") || "Still learning"}
- Best check-in time: ${profile.bestCheckinTime}
- His own words on what he wants: "${profile.goals}"`;
}

function formatMemories(memories: CoachMemory[]): string {
  if (memories.length === 0) return "";
  const lines = memories.map(
    (m) => `- [${m.type}] ${m.content} (confidence: ${m.confidence})`
  );
  return `
WHAT I'VE LEARNED ABOUT LUCAS:
${lines.join("\n")}`;
}

function formatGoals(goals: Goal[]): string {
  const active = goals.filter((g) => g.status === "in_progress");
  if (active.length === 0) return "";
  const lines = active.map((g) => {
    const completed = g.milestones.filter((m) => m.completed).length;
    const total = g.milestones.length;
    const progress = total > 0 ? `${Math.round((completed / total) * 100)}%` : "no milestones yet";
    return `- ${g.title} [${g.priority} priority, ${progress}] — ${g.description}`;
  });
  return `
ACTIVE GOALS:
${lines.join("\n")}`;
}

function formatCheckins(checkins: Checkin[]): string {
  if (checkins.length === 0) return "";
  const lines = checkins.map((c) => {
    const date = new Date(c.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    return `- ${date}: Accomplished: "${c.accomplishment.slice(0, 100)}" | Challenge: "${c.challenge.slice(0, 100)}" | Energy: ${c.energyLevel ?? "N/A"}/10`;
  });
  return `
RECENT CHECK-INS:
${lines.join("\n")}`;
}

interface BuildPromptParams {
  profile: UserProfile | null;
  memories: CoachMemory[];
  goals: Goal[];
  recentCheckins: Checkin[];
  streak: number;
}

export function buildSystemPrompt(params: BuildPromptParams): string {
  const sections = [
    BASE_PROMPT,
    formatProfile(params.profile),
    formatGoals(params.goals),
    formatCheckins(params.recentCheckins),
    formatMemories(params.memories),
    params.streak > 0
      ? `Current check-in streak: ${params.streak} days.`
      : "",
  ];

  return sections.filter(Boolean).join("\n\n");
}

export function buildCheckinPrompt(params: BuildPromptParams): string {
  const sections = [
    BASE_PROMPT,
    "You are responding to Lucas's daily check-in. He just shared what he accomplished, what was hard, and what he plans to do tomorrow. Acknowledge what he wrote, then provide coaching: point out patterns, suggest concrete next actions, and hold him accountable in the style he prefers.",
    formatProfile(params.profile),
    formatGoals(params.goals),
    formatCheckins(params.recentCheckins),
    formatMemories(params.memories),
  ];

  return sections.filter(Boolean).join("\n\n");
}

export function buildInsightExtractionPrompt(): string {
  return `Analyze the following interaction with Lucas. Extract any new insights about him that would help you coach him better in the future. Return ONLY a JSON array.

Types of insights to extract:
- "pattern": Recurring behaviors ("Lucas tends to lose momentum on Fridays", "Lucas often mentions imposter syndrome when starting new projects")
- "preference": Communication or work preferences ("Lucas responds better to data-driven arguments than emotional appeals")
- "goal_update": Progress or changes to goals ("Lucas is considering pivoting from freelancing to building a SaaS")
- "personal_detail": Facts about Lucas's life, work, or situation ("Lucas has a side project in e-commerce")
- "insight": General coaching insight ("Lucas does his best work in the morning, should schedule deep work there")

Rules:
- Only return insights with confidence > 0.6.
- Maximum 5 new insights. Fewer is fine. Zero is fine if nothing new.
- Be specific, not generic. "Lucas wants to be productive" is useless.
- Focus on patterns you can act on as a coach.

Return format: [{"type": "...", "content": "...", "confidence": 0.9}]`;
}
