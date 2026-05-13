import { z } from "zod";

export const milestoneSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Milestone title is required"),
  completed: z.boolean(),
  completedAt: z.string().nullable(),
});

export const goalSchema = z.object({
  title: z.string().min(1, "Goal title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.enum([
    "career",
    "learning",
    "health",
    "finance",
    "creative",
    "other",
  ]),
  priority: z.enum(["high", "medium", "low"]),
  status: z.enum(["not_started", "in_progress", "completed", "paused"]),
  targetDate: z.string().nullable(),
  milestones: z.array(milestoneSchema),
});

export const checkinSchema = z.object({
  accomplishment: z.string().min(1, "What did you accomplish today?"),
  challenge: z.string().min(1, "What was hard?"),
  tomorrowPlan: z.string().min(1, "What's one thing for tomorrow?"),
  energyLevel: z.number().min(1).max(10).nullable(),
  focusLevel: z.number().min(1).max(10).nullable(),
  moodRating: z.number().min(1).max(10).nullable(),
});

export const chatSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  conversationId: z.string().optional(),
});

export const profileSchema = z.object({
  name: z.string().min(1),
  communicationStyle: z.enum(["direct", "gentle", "balanced"]),
  motivationalStyle: z.enum(["challenging", "supportive", "analytical"]),
  verbosity: z.enum(["brief", "detailed"]),
  accountabilityPreference: z.enum([
    "gentle_nudge",
    "direct_confrontation",
    "data_driven",
  ]),
  whatMotivates: z.array(z.string()),
  burnoutSignals: z.array(z.string()),
  bestCheckinTime: z.string(),
  goals: z.string(),
});

export const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export const contactSchema = z.object({
  subject: z.string().min(1),
  message: z.string().min(1),
});
