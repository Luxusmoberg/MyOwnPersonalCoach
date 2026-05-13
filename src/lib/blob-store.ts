import fs from "fs/promises";
import path from "path";
import { getUserId } from "@/lib/auth";

// In-memory store shared across all routes in the same process
const store = new Map<string, unknown>();
let loaded = false;

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

async function loadFromDisk() {
  if (loaded) return;
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const data = JSON.parse(raw);
    for (const [key, value] of Object.entries(data)) {
      store.set(key, value);
    }
  } catch {
    // No data file yet — that's fine
  }
  loaded = true;
}

async function saveToDisk() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const data: Record<string, unknown> = {};
    for (const [key, value] of store.entries()) {
      data[key] = value;
    }
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } catch {
    // Disk write failed — data is still in memory
  }
}

function readOne<T>(key: string): T | null {
  const value = store.get(key);
  return value !== undefined ? (value as T) : null;
}

function writeOne<T>(key: string, data: T): void {
  store.set(key, data);
  saveToDisk().catch(() => {}); // Fire-and-forget persistence
}

function deleteOne(key: string): void {
  store.delete(key);
  saveToDisk().catch(() => {});
}

function readCollection<T>(prefix: string): T[] {
  const items: T[] = [];
  for (const [key, value] of store.entries()) {
    if (key.startsWith(prefix)) {
      items.push(value as T);
    }
  }
  return items;
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
  await loadFromDisk();
  const users = readCollection<UserAccount>("accounts/");
  return users.find((u) => u.username === username) || null;
}

export async function getUserByEmail(email: string): Promise<UserAccount | null> {
  await loadFromDisk();
  const users = readCollection<UserAccount>("accounts/");
  return users.find((u) => u.email === email) || null;
}

export async function getUserById(id: string): Promise<UserAccount | null> {
  await loadFromDisk();
  return readOne<UserAccount>(`accounts/${id}`);
}

export async function createUserAccount(user: UserAccount): Promise<void> {
  await loadFromDisk();
  writeOne(`accounts/${user.id}`, user);
}

// === User-scoped ===

export async function getProfile(): Promise<UserProfile | null> {
  await loadFromDisk();
  const key = await scopedKey("profile");
  return readOne<UserProfile>(key);
}

export async function setProfile(profile: UserProfile): Promise<void> {
  const key = await scopedKey("profile");
  writeOne(key, profile);
}

export async function getAppState(): Promise<AppState> {
  await loadFromDisk();
  const { DEFAULT_APP_STATE } = await import("@/types/app-state");
  const key = await scopedKey("app-state");
  const state = readOne<AppState>(key);
  return state ?? { ...DEFAULT_APP_STATE };
}

export async function setAppState(state: AppState): Promise<void> {
  const key = await scopedKey("app-state");
  writeOne(key, state);
}

export async function getGoals(): Promise<Goal[]> {
  await loadFromDisk();
  const key = await scopedKey("");
  return readCollection<Goal>(`${key}goals/`);
}

export async function getGoal(id: string): Promise<Goal | null> {
  await loadFromDisk();
  const key = await scopedKey(`goals/${id}`);
  return readOne<Goal>(key);
}

export async function setGoal(id: string, goal: Goal): Promise<void> {
  const key = await scopedKey(`goals/${id}`);
  writeOne(key, goal);
}

export async function deleteGoal(id: string): Promise<void> {
  const key = await scopedKey(`goals/${id}`);
  deleteOne(key);
}

export async function getCheckins(): Promise<Checkin[]> {
  await loadFromDisk();
  const key = await scopedKey("");
  return readCollection<Checkin>(`${key}checkins/`);
}

export async function getCheckin(id: string): Promise<Checkin | null> {
  await loadFromDisk();
  const key = await scopedKey(`checkins/${id}`);
  return readOne<Checkin>(key);
}

export async function setCheckin(id: string, checkin: Checkin): Promise<void> {
  const key = await scopedKey(`checkins/${id}`);
  writeOne(key, checkin);
}

export async function getConversations(): Promise<Conversation[]> {
  await loadFromDisk();
  const key = await scopedKey("");
  return readCollection<Conversation>(`${key}conversations/`);
}

export async function getConversation(id: string): Promise<Conversation | null> {
  await loadFromDisk();
  const key = await scopedKey(`conversations/${id}`);
  return readOne<Conversation>(key);
}

export async function setConversation(id: string, conversation: Conversation): Promise<void> {
  const key = await scopedKey(`conversations/${id}`);
  writeOne(key, conversation);
}

export async function deleteConversation(id: string): Promise<void> {
  const key = await scopedKey(`conversations/${id}`);
  deleteOne(key);
}

export async function getMemories(): Promise<CoachMemory[]> {
  await loadFromDisk();
  const key = await scopedKey("");
  return readCollection<CoachMemory>(`${key}memories/`);
}

export async function getMemory(id: string): Promise<CoachMemory | null> {
  await loadFromDisk();
  const key = await scopedKey(`memories/${id}`);
  return readOne<CoachMemory>(key);
}

export async function setMemory(id: string, memory: CoachMemory): Promise<void> {
  const key = await scopedKey(`memories/${id}`);
  writeOne(key, memory);
}

export async function deleteMemory(id: string): Promise<void> {
  const key = await scopedKey(`memories/${id}`);
  deleteOne(key);
}
