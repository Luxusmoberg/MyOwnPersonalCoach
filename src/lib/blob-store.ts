import fs from "fs/promises";
import path from "path";
import { getUserId } from "@/lib/auth";

const DATA_DIR = path.join("/tmp", "lucas-coach-data");

async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {
    // Already exists
  }
}

async function readOne<T>(key: string): Promise<T | null> {
  try {
    const filePath = path.join(DATA_DIR, `${key}.json`);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function writeOne<T>(key: string, data: T): Promise<void> {
  const filePath = path.join(DATA_DIR, `${key}.json`);
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function deleteOne(key: string): Promise<void> {
  try {
    const filePath = path.join(DATA_DIR, `${key}.json`);
    await fs.unlink(filePath);
  } catch {
    // Doesn't exist
  }
}

async function readCollection<T>(prefix: string): Promise<T[]> {
  try {
    const dir = path.join(DATA_DIR, prefix);
    const entries = await fs.readdir(dir, { recursive: true });
    const items: T[] = [];
    for (const entry of entries) {
      const key = prefix + (entry as string).replace(".json", "");
      const item = await readOne<T>(key);
      if (item) items.push(item);
    }
    return items;
  } catch {
    return [];
  }
}

// === User-scoped keys ===

async function scopedKey(suffix: string): Promise<string> {
  const userId = await getUserId();
  if (!userId) throw new Error("Not authenticated");
  return `users/${userId}/${suffix}`;
}

import type { UserProfile } from "@/types/user";
import type { AppState } from "@/types/app-state";
import type { Goal } from "@/types/goal";
import type { Checkin } from "@/types/checkin";
import type { Conversation } from "@/types/conversation";
import type { CoachMemory } from "@/types/memory";
import type { UserAccount } from "@/types/user";

// === User Accounts (global) ===

export async function getUserByUsername(username: string): Promise<UserAccount | null> {
  const users = await readCollection<UserAccount>("accounts/");
  return users.find((u) => u.username === username) || null;
}

export async function getUserByEmail(email: string): Promise<UserAccount | null> {
  const users = await readCollection<UserAccount>("accounts/");
  return users.find((u) => u.email === email) || null;
}

export async function getUserById(id: string): Promise<UserAccount | null> {
  return readOne<UserAccount>(`accounts/${id}`);
}

export async function createUserAccount(user: UserAccount): Promise<void> {
  await writeOne(`accounts/${user.id}`, user);
}

// === User-scoped ===

export async function getProfile(): Promise<UserProfile | null> {
  const key = await scopedKey("profile");
  return readOne<UserProfile>(key);
}

export async function setProfile(profile: UserProfile): Promise<void> {
  const key = await scopedKey("profile");
  await writeOne(key, profile);
}

export async function getAppState(): Promise<AppState> {
  const { DEFAULT_APP_STATE } = await import("@/types/app-state");
  const key = await scopedKey("app-state");
  const state = await readOne<AppState>(key);
  return state ?? { ...DEFAULT_APP_STATE };
}

export async function setAppState(state: AppState): Promise<void> {
  const key = await scopedKey("app-state");
  await writeOne(key, state);
}

export async function getGoals(): Promise<Goal[]> {
  const key = await scopedKey("");
  return readCollection<Goal>(`${key}goals/`);
}

export async function getGoal(id: string): Promise<Goal | null> {
  const key = await scopedKey(`goals/${id}`);
  return readOne<Goal>(key);
}

export async function setGoal(id: string, goal: Goal): Promise<void> {
  const key = await scopedKey(`goals/${id}`);
  await writeOne(key, goal);
}

export async function deleteGoal(id: string): Promise<void> {
  const key = await scopedKey(`goals/${id}`);
  await deleteOne(key);
}

export async function getCheckins(): Promise<Checkin[]> {
  const key = await scopedKey("");
  return readCollection<Checkin>(`${key}checkins/`);
}

export async function getCheckin(id: string): Promise<Checkin | null> {
  const key = await scopedKey(`checkins/${id}`);
  return readOne<Checkin>(key);
}

export async function setCheckin(id: string, checkin: Checkin): Promise<void> {
  const key = await scopedKey(`checkins/${id}`);
  await writeOne(key, checkin);
}

export async function getConversations(): Promise<Conversation[]> {
  const key = await scopedKey("");
  return readCollection<Conversation>(`${key}conversations/`);
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const key = await scopedKey(`conversations/${id}`);
  return readOne<Conversation>(key);
}

export async function setConversation(id: string, conversation: Conversation): Promise<void> {
  const key = await scopedKey(`conversations/${id}`);
  await writeOne(key, conversation);
}

export async function deleteConversation(id: string): Promise<void> {
  const key = await scopedKey(`conversations/${id}`);
  await deleteOne(key);
}

export async function getMemories(): Promise<CoachMemory[]> {
  const key = await scopedKey("");
  return readCollection<CoachMemory>(`${key}memories/`);
}

export async function getMemory(id: string): Promise<CoachMemory | null> {
  const key = await scopedKey(`memories/${id}`);
  return readOne<CoachMemory>(key);
}

export async function setMemory(id: string, memory: CoachMemory): Promise<void> {
  const key = await scopedKey(`memories/${id}`);
  await writeOne(key, memory);
}

export async function deleteMemory(id: string): Promise<void> {
  const key = await scopedKey(`memories/${id}`);
  await deleteOne(key);
}
