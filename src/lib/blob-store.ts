import { getStore } from "@netlify/blobs";
import fs from "fs/promises";
import path from "path";
import { getUserId } from "@/lib/auth";
import { createHash } from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");

function isNetlifyDev() {
  return !!process.env.NETLIFY_DEV || !!process.env.NETLIFY;
}

function getBlobStore() {
  return getStore("lucas-coach");
}

// File-based fallback for local dev
async function ensureDataDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {
    // Already exists
  }
}

async function fileRead<T>(key: string): Promise<T | null> {
  try {
    const filePath = path.join(DATA_DIR, `${key}.json`);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function fileWrite<T>(key: string, data: T): Promise<void> {
  const filePath = path.join(DATA_DIR, `${key}.json`);
  const dir = path.dirname(filePath);
  await ensureDataDir(dir);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function fileDelete(key: string): Promise<void> {
  try {
    const filePath = path.join(DATA_DIR, `${key}.json`);
    await fs.unlink(filePath);
  } catch {
    // Doesn't exist
  }
}

async function fileList(prefix: string): Promise<string[]> {
  try {
    const dir = path.join(DATA_DIR, prefix);
    const entries = await fs.readdir(dir, { recursive: true });
    return entries
      .filter((f) => (f as string).endsWith(".json"))
      .map((f) => prefix + (f as string).replace(".json", ""));
  } catch {
    return [];
  }
}

// Public API — auto-selects Netlify Blobs or local files

async function readOne<T>(key: string): Promise<T | null> {
  if (isNetlifyDev()) {
    const store = getBlobStore();
    try {
      const raw = await store.get(key);
      if (!raw) return null;
      const data = typeof raw === "string" ? raw : new TextDecoder().decode(raw);
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return fileRead<T>(key);
}

async function writeOne<T>(key: string, data: T): Promise<void> {
  if (isNetlifyDev()) {
    const store = getBlobStore();
    await store.setJSON(key, data);
    return;
  }
  await fileWrite(key, data);
}

async function deleteOne(key: string): Promise<void> {
  if (isNetlifyDev()) {
    const store = getBlobStore();
    try {
      await store.delete(key);
    } catch {
      // Key doesn't exist
    }
    return;
  }
  await fileDelete(key);
}

async function readCollection<T>(prefix: string): Promise<T[]> {
  if (isNetlifyDev()) {
    const store = getBlobStore();
    try {
      const { blobs } = await store.list({ prefix });
      const items: T[] = [];
      for (const blob of blobs) {
        const raw = await store.get(blob.key);
        if (raw) {
          const data = typeof raw === "string" ? raw : new TextDecoder().decode(raw);
          items.push(JSON.parse(data));
        }
      }
      return items;
    } catch {
      return [];
    }
  }
  const keys = await fileList(prefix);
  const items: T[] = [];
  for (const key of keys) {
    const item = await fileRead<T>(key);
    if (item) items.push(item);
  }
  return items;
}

// === User-scoped helpers ===
// All user data is namespaced: {userId}/profile, {userId}/goals/{id}, etc.

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

// === User Accounts (global, not user-scoped) ===

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

// === User-scoped profile ===

export async function getProfile(): Promise<UserProfile | null> {
  const key = await scopedKey("profile");
  return readOne<UserProfile>(key);
}

export async function setProfile(profile: UserProfile): Promise<void> {
  const key = await scopedKey("profile");
  await writeOne(key, profile);
}

// === User-scoped app state ===

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

// === User-scoped goals ===

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

// === User-scoped checkins ===

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

// === User-scoped conversations ===

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

// === User-scoped memories ===

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
