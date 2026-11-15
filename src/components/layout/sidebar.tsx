"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
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
    <aside className="hidden lg:flex flex-col w-64 border-r border-brand-platinum bg-white h-screen sticky top-0 z-40 select-none dark:bg-brand-navy dark:border-brand-navyLight">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center border-b border-brand-platinum dark:border-brand-navyLight">
        <Link href="/dashboard" className="transition-opacity hover:opacity-90">
          <QueueFlowLogo />
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-brand-navy/50 dark:text-brand-platinum/50">
          Overview
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
                "group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                isActive
                  ? "bg-brand-sage/25 text-brand-forest font-bold border-l-2 border-brand-pine dark:text-brand-stone dark:bg-brand-pine/20"
                  : "text-brand-navy/70 hover:bg-brand-platinumLight hover:text-brand-navy font-medium dark:text-brand-platinum/70 dark:hover:bg-brand-navyLight dark:hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive
                      ? "text-brand-fern"
                      : "text-brand-navy/40 group-hover:text-brand-navy dark:text-brand-platinum/40 dark:group-hover:text-brand-platinum"
                  )}
                />
                <span>{item.label}</span>
              </div>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-brand-fern" />
              )}
            </Link>
          );
        })}
      </div>

      {/* User Footer & Logout */}
      <div className="p-4 border-t border-brand-platinum bg-brand-platinumLight/60 dark:border-brand-navyLight dark:bg-brand-navyDark">
        <div className="flex items-center gap-3 p-2 rounded-lg mb-2">
          <div className="w-8 h-8 rounded-full bg-brand-forest text-brand-stone border border-brand-pine flex items-center justify-center font-bold text-xs shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : "M"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-brand-navy dark:text-white truncate">
              {user?.name || "Manager"}
            </p>
            <p className="text-[11px] text-brand-navy/60 dark:text-brand-platinum/60 truncate">
              {user?.email || "manager@queueflow.com"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-brand-navy/70 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 dark:text-brand-platinum/70 dark:hover:bg-red-950/40"
        >
          <div className="flex items-center gap-2">
            <LogOut className="w-3.5 h-3.5" />
            <span>{loggingOut ? "Signing out..." : "Log Out"}</span>
          </div>
          <ChevronRight className="w-3 h-3 text-brand-navy/40 dark:text-brand-platinum/40" />
        </button>
      </div>
    </aside>
  );
}
