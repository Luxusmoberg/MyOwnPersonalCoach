"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { UserProfile } from "@/types/user";
import type { AppState } from "@/types/app-state";
import { DEFAULT_PROFILE } from "@/types/user";
import { DEFAULT_APP_STATE } from "@/types/app-state";

interface CoachContextType {
  profile: UserProfile | null;
  appState: AppState;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const CoachContext = createContext<CoachContextType>({
  profile: null,
  appState: DEFAULT_APP_STATE,
  isLoading: true,
  refresh: async () => {},
});

export function CoachProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [appState, setAppState] = useState<AppState>(DEFAULT_APP_STATE);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    try {
      const [profileRes, stateRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/app-state"),
      ]);
      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data.name ? data : null);
      }
      if (stateRes.ok) {
        const data = await stateRes.json();
        setAppState(data);
      }
    } catch {
      // Silently fail
    }
  };

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, []);

  return (
    <CoachContext.Provider value={{ profile, appState, isLoading, refresh }}>
      {children}
    </CoachContext.Provider>
  );
}

export function useCoach() {
  return useContext(CoachContext);
}
