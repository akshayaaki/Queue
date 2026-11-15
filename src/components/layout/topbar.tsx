"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Layers,
  ChevronDown,
} from "lucide-react";
import { QueueFlowLogo } from "@/components/ui/logo";
import { useTheme } from "./theme-provider";
import { isSoundEnabled, toggleSound } from "@/components/audio/chime";
import { QueueSummary } from "@/types";
import { cn } from "@/lib/utils";

interface TopbarProps {
  user?: { name: string; email: string };
  title?: string;
  activeQueueId?: string;
}

export function Topbar({ user, title, activeQueueId }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [soundOn, setSoundOn] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [queues, setQueues] = useState<QueueSummary[]>([]);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setSoundOn(isSoundEnabled());

    fetch("/api/queues")
      .then((res) => res.json())
      .then((data) => {
        if (data.queues) {
          setQueues(data.queues);
        }
      })
      .catch(() => {});
  }, []);

  const handleSoundToggle = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  const currentQueue = queues.find((q) => q.id === activeQueueId);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 sm:px-6 backdrop-blur-md dark:bg-slate-900/90 dark:border-slate-800">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-white capitalize">
            {title || "Dashboard"}
          </h1>

          {/* Fast Queue Switcher if user has queues */}
          {queues.length > 0 && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setSwitcherOpen(!switcherOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800 transition-all shadow-xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
              >
                <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-slate-900 dark:text-white">
                  {currentQueue ? currentQueue.name : "Select Queue"}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {switcherOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setSwitcherOpen(false)}
                  />
                  <div className="absolute left-0 mt-1.5 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100 dark:bg-slate-900 dark:border-slate-800">
                    <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Switch Active Queue
                    </div>
                    {queues.map((q) => (
                      <Link
                        key={q.id}
                        href={`/queues/${q.id}`}
                        onClick={() => setSwitcherOpen(false)}
                        className={cn(
                          "flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors",
                          q.id === activeQueueId
                            ? "bg-blue-50 text-blue-700 font-semibold dark:bg-blue-950/50 dark:text-blue-300"
                            : "hover:bg-slate-50 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        )}
                      >
                        <span className="truncate">{q.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {q.queueCode}
                        </span>
                      </Link>
                    ))}
                    <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                      <Link
                        href="/queues"
                        onClick={() => setSwitcherOpen(false)}
                        className="block px-2.5 py-1.5 text-center text-xs text-blue-600 hover:underline font-medium dark:text-blue-400"
                      >
                        + Manage all queues
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Sync Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold">Live Connected</span>
        </div>

        {/* Audio Chime Toggle */}
        <button
          onClick={handleSoundToggle}
          title={soundOn ? "Mute Call Chime" : "Enable Call Chime"}
          className={cn(
            "p-2 rounded-lg border transition-all text-xs flex items-center gap-1.5",
            soundOn
              ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-300"
              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
          )}
        >
          {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden xl:inline text-[11px] font-medium">
            {soundOn ? "Chime On" : "Muted"}
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle Light / Dark Mode"
          className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:text-white"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Avatar */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : "M"}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-white/98 backdrop-blur-md lg:hidden p-6 space-y-4 animate-in slide-in-from-top-4 duration-200 dark:bg-slate-900/98">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Dashboard
            </Link>
            <Link
              href="/queues"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              My Queues
            </Link>
            <Link
              href="/tokens"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Token History
            </Link>
            <Link
              href="/analytics"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Analytics
            </Link>
            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Settings
            </Link>
          </div>
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/login");
              }}
              className="w-full py-2.5 text-center text-sm font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-lg"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
