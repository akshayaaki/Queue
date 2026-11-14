"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Radio,
  History,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { QueueFlowLogo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Queues", href: "/queues", icon: Layers },
  { label: "Token History", href: "/tokens", icon: History },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ user }: { user?: { name: string; email: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error(err);
      setLoggingOut(false);
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card/60 backdrop-blur-md h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center border-b border-border/80">
        <Link href="/dashboard" className="transition-opacity hover:opacity-90">
          <QueueFlowLogo />
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
          Operations
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-palette-bisque/70 text-[#2E2419] font-semibold shadow-xs border border-palette-ochre/20 dark:bg-palette-ochre/15 dark:text-palette-ochre dark:border-palette-ochre/25"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive
                      ? "text-palette-ochreDark dark:text-palette-ochre"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span>{item.label}</span>
              </div>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-palette-ochre" />
              )}
            </Link>
          );
        })}
      </div>

      {/* User Footer & Logout */}
      <div className="p-4 border-t border-border/80 bg-muted/20">
        <div className="flex items-center gap-3 p-2 rounded-xl mb-2">
          <div className="w-9 h-9 rounded-full bg-palette-bisque text-palette-ochreDark flex items-center justify-center font-bold text-sm border border-palette-ochre/30 shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : "M"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              {user?.name || "Manager"}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {user?.email || "manager@queueflow.com"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors disabled:opacity-50"
        >
          <div className="flex items-center gap-2">
            <LogOut className="w-3.5 h-3.5" />
            <span>{loggingOut ? "Signing out..." : "Log Out"}</span>
          </div>
          <ChevronRight className="w-3 h-3 text-red-400" />
        </button>
      </div>
    </aside>
  );
}
