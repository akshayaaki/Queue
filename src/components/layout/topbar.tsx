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
  Radio,
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
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setSoundOn(isSoundEnabled());

    // Fetch user's queues for fast switcher
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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/75 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-foreground capitalize">
            {title || "Dashboard"}
          </h1>

          {/* Fast Queue Switcher if user has queues */}
          {queues.length > 0 && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setSwitcherOpen(!switcherOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background/80 hover:bg-muted text-xs font-medium text-foreground transition-all shadow-2xs"
              >
                <Layers className="w-3.5 h-3.5 text-palette-ochreDark" />
                <span className="font-semibold text-palette-ochreDark">
                  {currentQueue ? currentQueue.name : "Select Queue"}
                </span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </button>

              {switcherOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setSwitcherOpen(false)}
                  />
                  <div className="absolute left-0 mt-1.5 w-60 rounded-xl border border-border bg-card p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
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
                            ? "bg-palette-bisque text-palette-charcoal font-semibold dark:bg-palette-ochre/20 dark:text-palette-ochre"
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        <span className="truncate">{q.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-muted text-muted-foreground">
                          {q.queueCode}
                        </span>
                      </Link>
                    ))}
                    <div className="border-t border-border mt-1 pt-1">
                      <Link
                        href="/queues"
                        onClick={() => setSwitcherOpen(false)}
                        className="block px-2.5 py-1.5 text-center text-xs text-palette-ochreDark hover:underline font-medium"
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

      {/* Right Controls: Realtime indicator, Audio chime toggle, Theme toggle, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Sync Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-palette-sage/20 border border-palette-sage/40 text-[11px] font-medium text-[#384824] dark:bg-palette-sage/10 dark:text-[#C5D5A0]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#586938] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#586938]"></span>
          </span>
          <span className="font-semibold">Live Sync</span>
        </div>

        {/* Audio Chime Toggle */}
        <button
          onClick={handleSoundToggle}
          title={soundOn ? "Mute Call Chime" : "Enable Call Chime"}
          className={cn(
            "p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5",
            soundOn
              ? "border-palette-ochre/30 bg-palette-bisque/60 text-palette-ochreDark hover:bg-palette-bisque"
              : "border-border bg-card text-muted-foreground hover:bg-muted"
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
          className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Mini Avatar */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-palette-parchment to-palette-ochre text-[#1E1914] flex items-center justify-center font-bold text-xs shadow-xs border border-palette-ochre/30">
            {user?.name ? user.name.charAt(0).toUpperCase() : "M"}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-background/95 backdrop-blur-md lg:hidden p-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted"
            >
              Dashboard
            </Link>
            <Link
              href="/queues"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted"
            >
              My Queues
            </Link>
            <Link
              href="/tokens"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted"
            >
              Token History
            </Link>
            <Link
              href="/analytics"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted"
            >
              Analytics
            </Link>
            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted"
            >
              Settings
            </Link>
          </div>
          <div className="pt-4 border-t border-border">
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/login");
              }}
              className="w-full py-2.5 text-center text-sm font-semibold text-red-600 bg-red-50 dark:bg-red-950/40 rounded-xl"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
