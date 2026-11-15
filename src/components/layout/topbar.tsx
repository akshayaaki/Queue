"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-brand-platinum bg-white/95 px-4 sm:px-6 backdrop-blur-md dark:bg-brand-navy/95 dark:border-brand-navyLight">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-brand-navy hover:bg-brand-platinumLight dark:text-brand-platinum dark:hover:bg-brand-navyLight"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-brand-navy dark:text-white capitalize">
            {title || "Dashboard"}
          </h1>

          {/* Fast Queue Switcher if user has queues */}
          {queues.length > 0 && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setSwitcherOpen(!switcherOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-brand-platinum bg-white hover:bg-brand-platinumLight text-xs font-semibold text-brand-navy transition-all shadow-xs dark:bg-brand-navyDark dark:border-brand-navyLight dark:text-white"
              >
                <Layers className="w-3.5 h-3.5 text-brand-fern" />
                <span className="font-bold text-brand-navy dark:text-white">
                  {currentQueue ? currentQueue.name : "Select Queue"}
                </span>
                <ChevronDown className="w-3 h-3 text-brand-navy/40 dark:text-brand-platinum/40" />
              </button>

              {switcherOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setSwitcherOpen(false)}
                  />
                  <div className="absolute left-0 mt-1.5 w-60 rounded-xl border border-brand-platinum bg-white p-1.5 shadow-dropdown z-50 animate-in fade-in zoom-in-95 duration-100 dark:bg-brand-navy dark:border-brand-navyLight">
                    <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-navy/40 dark:text-brand-platinum/40">
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
                            ? "bg-brand-sage/25 text-brand-forest font-bold dark:text-brand-stone dark:bg-brand-pine/20"
                            : "hover:bg-brand-platinumLight text-brand-navy font-medium dark:text-brand-platinum dark:hover:bg-brand-navyLight"
                        )}
                      >
                        <span className="truncate">{q.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-platinum text-brand-navy dark:bg-brand-navyDark dark:text-brand-gold">
                          {q.queueCode}
                        </span>
                      </Link>
                    ))}
                    <div className="border-t border-brand-platinum dark:border-brand-navyLight mt-1 pt-1">
                      <Link
                        href="/queues"
                        onClick={() => setSwitcherOpen(false)}
                        className="block px-2.5 py-1.5 text-center text-xs text-brand-navy font-bold hover:text-brand-gold transition-colors dark:text-brand-gold"
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
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span className="font-bold">Live Connected</span>
        </div>

        {/* Audio Chime Toggle */}
        <button
          onClick={handleSoundToggle}
          title={soundOn ? "Mute Call Chime" : "Enable Call Chime"}
          className={cn(
            "p-2 rounded-lg border transition-all text-xs flex items-center gap-1.5 font-semibold",
            soundOn
              ? "border-brand-sage bg-brand-sage/20 text-brand-forest hover:bg-brand-sage/30 dark:text-brand-stone"
              : "border-brand-platinum bg-white text-brand-navy/60 hover:bg-brand-platinumLight dark:bg-brand-navyDark dark:border-brand-navyLight dark:text-brand-platinum/60"
          )}
        >
          {soundOn ? <Volume2 className="w-4 h-4 text-brand-fern dark:text-brand-stone" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden xl:inline text-[11px]">
            {soundOn ? "Chime On" : "Muted"}
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle Light / Dark Mode"
          className="p-2 rounded-lg border border-brand-platinum bg-white text-brand-navy hover:bg-brand-platinumLight transition-all dark:bg-brand-navyDark dark:border-brand-navyLight dark:text-brand-platinum"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-brand-fern" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Avatar */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-brand-platinum dark:border-brand-navyLight">
          <div className="w-8 h-8 rounded-full bg-brand-forest text-brand-stone border border-brand-pine flex items-center justify-center font-bold text-xs shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : "M"}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-white/98 backdrop-blur-md lg:hidden p-6 space-y-4 animate-in slide-in-from-top-4 duration-200 dark:bg-brand-navy/98">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-semibold text-brand-navy hover:bg-brand-platinumLight dark:text-white dark:hover:bg-brand-navyLight"
            >
              Dashboard
            </Link>
            <Link
              href="/queues"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-semibold text-brand-navy hover:bg-brand-platinumLight dark:text-white dark:hover:bg-brand-navyLight"
            >
              My Queues
            </Link>
            <Link
              href="/tokens"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-semibold text-brand-navy hover:bg-brand-platinumLight dark:text-white dark:hover:bg-brand-navyLight"
            >
              Token History
            </Link>
            <Link
              href="/analytics"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-semibold text-brand-navy hover:bg-brand-platinumLight dark:text-white dark:hover:bg-brand-navyLight"
            >
              Analytics
            </Link>
            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-semibold text-brand-navy hover:bg-brand-platinumLight dark:text-white dark:hover:bg-brand-navyLight"
            >
              Settings
            </Link>
          </div>
          <div className="pt-4 border-t border-brand-platinum dark:border-brand-navyLight">
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/login");
              }}
              className="w-full py-2.5 text-center text-sm font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-lg"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
