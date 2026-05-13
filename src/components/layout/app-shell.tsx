"use client";

import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/providers/auth-provider";
import { CoachProvider } from "@/providers/coach-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Loader2 } from "lucide-react";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname === "/login" || pathname === "/register";

  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <CoachProvider>
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </CoachProvider>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Shell>{children}</Shell>
    </AuthProvider>
  );
}
