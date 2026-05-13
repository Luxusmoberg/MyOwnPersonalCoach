export interface AppState {
  onboardingComplete: boolean;
  currentStreak: number;
  longestStreak: number;
  lastCheckinDate: string | null;
  lastActiveDate: string;
  totalCheckins: number;
  totalConversations: number;
}

export const DEFAULT_APP_STATE: AppState = {
  onboardingComplete: false,
  currentStreak: 0,
  longestStreak: 0,
  lastCheckinDate: null,
  lastActiveDate: new Date().toISOString(),
  totalCheckins: 0,
  totalConversations: 0,
};
