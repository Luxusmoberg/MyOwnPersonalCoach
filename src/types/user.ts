export interface UserProfile {
  name: string;
  communicationStyle: "direct" | "gentle" | "balanced";
  motivationalStyle: "challenging" | "supportive" | "analytical";
  verbosity: "brief" | "detailed";
  accountabilityPreference:
    | "gentle_nudge"
    | "direct_confrontation"
    | "data_driven";
  whatMotivates: string[];
  burnoutSignals: string[];
  bestCheckinTime: string;
  goals: string;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_PROFILE: Partial<UserProfile> = {
  communicationStyle: "balanced",
  motivationalStyle: "supportive",
  verbosity: "brief",
  accountabilityPreference: "gentle_nudge",
  whatMotivates: [],
  burnoutSignals: [],
  bestCheckinTime: "evening",
  goals: "",
};

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}
