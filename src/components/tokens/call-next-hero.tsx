"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Megaphone,
  Play,
  CheckCircle2,
  FastForward,
  RotateCcw,
  XCircle,
  Clock,
  User,
  Phone,
  FileText,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { TokenItem } from "@/types";
import { playCallChime } from "@/components/audio/chime";
import { toast } from "sonner";
import { cn, formatDuration } from "@/lib/utils";

interface CallNextHeroProps {
  queueId: string;
  currentlyServing?: TokenItem | null;
  nextUp?: TokenItem | null;
  waitingCount: number;
  onActionComplete: () => void;
  onOpenCancelModal: (token: TokenItem) => void;
}

export function CallNextHero({
  queueId,
  currentlyServing,
  nextUp,
  waitingCount,
  onActionComplete,
  onOpenCancelModal,
}: CallNextHeroProps) {
  const [calling, setCalling] = useState(false);
  const [acting, setActing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Live timer for currently serving customer
  useEffect(() => {
    if (!currentlyServing) {
      setElapsedSeconds(0);
      return;
    }

    const refTime = currentlyServing.serviceStartedAt
      ? new Date(currentlyServing.serviceStartedAt).getTime()
      : currentlyServing.calledAt
      ? new Date(currentlyServing.calledAt).getTime()
      : new Date(currentlyServing.createdAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((now - refTime) / 1000)));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [currentlyServing]);

  // Keyboard shortcut: Press Alt+N or Space (when not focusing an input) to Call Next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || "").toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") return;

      if ((e.altKey && e.key.toLowerCase() === "n") || (e.key === " " && e.target === document.body)) {
        e.preventDefault();
        handleCallNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [waitingCount, calling]);

  const handleCallNext = async () => {
    if (calling) return;
    try {
      setCalling(true);
      const res = await fetch(`/api/queues/${queueId}/call-next`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to call next customer");
      }

      if (!data.token) {
        toast.info("No waiting customers in this queue.");
      } else {
        playCallChime();
        toast.success(`Now Calling: Token ${data.token.tokenNumber}!`);
      }
      onActionComplete();
    } catch (err: any) {
      toast.error(err.message || "Failed to call next customer");
    } finally {
      setCalling(false);
    }
  };

  const handleStartService = async () => {
    if (!currentlyServing || acting) return;
    try {
      setActing(true);
      const res = await fetch(`/api/tokens/${currentlyServing.id}/start-service`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to start service");
      toast.success(`Service started for ${currentlyServing.tokenNumber}`);
      onActionComplete();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActing(false);
    }
  };

  const handleCompleteService = async () => {
    if (!currentlyServing || acting) return;
    try {
      setActing(true);
      const res = await fetch(`/api/tokens/${currentlyServing.id}/complete`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to complete service");
      toast.success(`Service completed for ${currentlyServing.tokenNumber}`);
      onActionComplete();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActing(false);
    }
  };

  const handleSkip = async () => {
    if (!currentlyServing || acting) return;
    try {
      setActing(true);
      const res = await fetch(`/api/tokens/${currentlyServing.id}/skip`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to skip token");
      toast.info(`Token ${currentlyServing.tokenNumber} was skipped`);
      onActionComplete();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActing(false);
    }
  };

  const handleRecall = async () => {
    if (!currentlyServing || acting) return;
    try {
      setActing(true);
      const res = await fetch(`/api/tokens/${currentlyServing.id}/recall`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to recall token");
      playCallChime();
      toast.success(`Re-called ${currentlyServing.tokenNumber}!`);
      onActionComplete();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActing(false);
    }
  };

  const timerFormatted = `${Math.floor(elapsedSeconds / 60)
    .toString()
    .padStart(2, "0")}:${(elapsedSeconds % 60).toString().padStart(2, "0")}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
      {/* Hero Call Next Action Card (5 columns) */}
      <div className="lg:col-span-5 rounded-2xl border border-border bg-gradient-to-br from-[#FEFAE0]/80 via-card to-[#FAEDCD]/40 p-6 flex flex-col justify-between shadow-bespoke relative overflow-hidden dark:from-[#231E18] dark:to-[#1C1814]">
        {/* Subtle decorative background watermarks */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-palette-ochre/10 blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-palette-ochreDark flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-palette-ochre" />
              Counter Dispatch
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-palette-bisque/80 text-palette-charcoal font-semibold border border-palette-ochre/30 dark:bg-palette-ochre/20 dark:text-palette-ochre">
              {waitingCount} waiting
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-foreground font-serif">
            Call Next Customer
          </h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Atomically summons the first customer in sequence. Plays acoustic chime and updates all counters.
          </p>
        </div>

        {/* Primary Call Action Button */}
        <div className="my-6">
          <Button
            size="xl"
            variant="hero"
            disabled={calling || waitingCount === 0}
            onClick={handleCallNext}
            className="w-full flex items-center justify-center gap-3 text-base sm:text-lg group"
          >
            <Megaphone className={cn("w-5 h-5", calling ? "animate-spin" : "group-hover:rotate-12 transition-transform")} />
            <span>{calling ? "Calling Token..." : "CALL NEXT CUSTOMER"}</span>
            <ArrowRight className="w-4 h-4 ml-1 opacity-70 group-hover:translate-x-1 transition-transform" />
          </Button>
          <div className="mt-2 text-center text-[11px] text-muted-foreground/80 flex items-center justify-center gap-1.5">
            <span>Shortcut:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono font-semibold">
              Alt + N
            </kbd>
          </div>
        </div>

        {/* Next Up Sneak Peek */}
        <div className="p-3 rounded-xl bg-card/80 border border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Next in line:</span>
          </div>
          {nextUp ? (
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-palette-ochreDark">
                {nextUp.tokenNumber}
              </span>
              <span className="text-xs text-foreground font-medium truncate max-w-[120px]">
                {nextUp.customerName}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">Queue is clear</span>
          )}
        </div>
      </div>

      {/* Currently Serving Spotlight Card (7 columns) */}
      <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-6 shadow-bespoke flex flex-col justify-between relative">
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Currently Serving
              </span>
              {currentlyServing && (
                <StatusBadge status={currentlyServing.status} size="sm" />
              )}
            </div>

            {currentlyServing && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-palette-celery/70 border border-palette-sage text-[#243516] font-mono font-bold text-xs shadow-2xs dark:bg-palette-sage/20 dark:text-[#C5D5A0]">
                <Clock className="w-3.5 h-3.5" />
                <span>Elapsed: {timerFormatted}</span>
              </div>
            )}
          </div>

          {currentlyServing ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-palette-ochreDark dark:text-palette-ochre">
                    {currentlyServing.tokenNumber}
                  </div>
                  <div className="text-lg font-bold text-foreground mt-0.5">
                    {currentlyServing.customerName}
                  </div>
                </div>

                {/* Contact Pill */}
                <div className="space-y-1 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/60">
                  {currentlyServing.phone && (
                    <div className="flex items-center gap-1.5 font-medium">
                      <Phone className="w-3 h-3 text-palette-ochreDark" />
                      <span>{currentlyServing.phone}</span>
                    </div>
                  )}
                  {currentlyServing.email && (
                    <div className="text-[11px] truncate max-w-[200px]">
                      {currentlyServing.email}
                    </div>
                  )}
                  {!currentlyServing.phone && !currentlyServing.email && (
                    <div className="italic text-muted-foreground">No contact details provided</div>
                  )}
                </div>
              </div>

              {currentlyServing.notes && (
                <div className="p-3 rounded-xl bg-palette-parchment/60 border border-palette-ochre/20 text-xs text-[#523F27] flex items-start gap-2 dark:bg-[#2A231C] dark:text-[#E2C7A5]">
                  <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5 text-palette-ochreDark" />
                  <p className="line-clamp-2">{currentlyServing.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center text-muted-foreground">
              <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-muted-foreground/60" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                No Customer Active
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mt-1">
                Click "Call Next Customer" or choose a token from the waiting list to begin service.
              </p>
            </div>
          )}
        </div>

        {/* Counter Action Controls */}
        {currentlyServing && (
          <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {currentlyServing.status === "CALLED" && (
                <Button
                  size="sm"
                  variant="sage"
                  disabled={acting}
                  onClick={handleStartService}
                  className="gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Start Service
                </Button>
              )}

              {(currentlyServing.status === "SERVING" || currentlyServing.status === "CALLED") && (
                <Button
                  size="sm"
                  variant="default"
                  disabled={acting}
                  onClick={handleCompleteService}
                  className="gap-1.5 bg-[#586938] hover:bg-[#45542C] text-white"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Complete Service
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                disabled={acting}
                onClick={handleRecall}
                className="gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Recall
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={acting}
                onClick={handleSkip}
                className="gap-1.5"
              >
                <FastForward className="w-3.5 h-3.5" />
                Skip
              </Button>
            </div>

            <Button
              size="sm"
              variant="destructive"
              disabled={acting}
              onClick={() => onOpenCancelModal(currentlyServing)}
              className="gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancel Token
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
