"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useCoach } from "@/providers/coach-provider";
import {
  LayoutDashboard,
  ClipboardCheck,
  MessageSquare,
  Target,
  Brain,
  Settings,
  LogOut,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/checkin", label: "Check In", icon: ClipboardCheck },
  { href: "/chat", label: "Coach Chat", icon: MessageSquare },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/memories", label: "Memories", icon: Brain },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { profile, appState } = useCoach();

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "LC";

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight">Lucas Coach</h1>
            <p className="text-xs text-muted-foreground">Your AI coach</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Streak + User */}
      <div className="p-4 border-t space-y-4">
        {appState.currentStreak > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 px-3 py-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
              {appState.currentStreak} day streak
            </span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {profile?.name || "Lucas"}
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
