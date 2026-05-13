import { getStore } from "@netlify/blobs";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function isNetlifyDev() {
  return !!process.env.NETLIFY_DEV || !!process.env.NETLIFY;
}

function getBlobStore() {
  return getStore("lucas-coach");
}

// File-based fallback for local dev without Netlify CLI
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Already exists
  }
}

async function fileRead<T>(key: string): Promise<T | null> {
  await ensureDataDir();
  try {
    const filePath = path.join(DATA_DIR, `${key}.json`);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function fileWrite<T>(key: string, data: T): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, `${key}.json`);
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
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
  await ensureDataDir();
  try {
    const dir = path.join(DATA_DIR, prefix);
    const files = await fs.readdir(dir, { recursive: true });
    return files
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

// Typed collection helpers

import type { UserProfile } from "@/types/user";
import type { AppState } from "@/types/app-state";
import type { Goal } from "@/types/goal";
import type { Checkin } from "@/types/checkin";
import type { Conversation } from "@/types/conversation";
import type { CoachMemory } from "@/types/memory";

export async function getProfile() {
  return readOne<UserProfile>("profile");
}

export async function setProfile(profile: UserProfile) {
  await writeOne("profile", profile);
}

export async function getAppState() {
  const { DEFAULT_APP_STATE } = await import("@/types/app-state");
  const state = await readOne<AppState>("app-state");
  return state ?? DEFAULT_APP_STATE;
}

export async function setAppState(state: AppState) {
  await writeOne("app-state", state);
}

export async function getGoals(): Promise<Goal[]> {
  return readCollection<Goal>("goals/");
}

export async function getGoal(id: string) {
  return readOne<Goal>(`goals/${id}`);
}

export async function setGoal(id: string, goal: Goal) {
  await writeOne(`goals/${id}`, goal);
}

export async function deleteGoal(id: string) {
  await deleteOne(`goals/${id}`);
}

export async function getCheckins(): Promise<Checkin[]> {
  return readCollection<Checkin>("checkins/");
}

export async function getCheckin(id: string) {
  return readOne<Checkin>(`checkins/${id}`);
}

export async function setCheckin(id: string, checkin: Checkin) {
  await writeOne(`checkins/${id}`, checkin);
}

export async function getConversations(): Promise<Conversation[]> {
  return readCollection<Conversation>("conversations/");
}

export async function getConversation(id: string) {
  return readOne<Conversation>(`conversations/${id}`);
}

export async function setConversation(id: string, conversation: Conversation) {
  await writeOne(`conversations/${id}`, conversation);
}

export async function deleteConversation(id: string) {
  await deleteOne(`conversations/${id}`);
}

export async function getMemories(): Promise<CoachMemory[]> {
  return readCollection<CoachMemory>("memories/");
}

export async function getMemory(id: string) {
  return readOne<CoachMemory>(`memories/${id}`);
}

export async function setMemory(id: string, memory: CoachMemory) {
  await writeOne(`memories/${id}`, memory);
}

export async function deleteMemory(id: string) {
  await deleteOne(`memories/${id}`);
}
