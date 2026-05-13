import { redirect } from "next/navigation";
import { getAppState } from "@/lib/blob-store";

export default async function HomePage() {
  const appState = await getAppState();

  if (!appState.onboardingComplete) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}
