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
  Phone,
  FileText,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { TokenItem } from "@/types";
import { playCallChime } from "@/components/audio/chime";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

  // Keyboard shortcut: Press Alt+N or Space to Call Next
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
      <div className="lg:col-span-5 rounded-xl border border-brand-platinum bg-white p-6 flex flex-col justify-between shadow-card dark:bg-brand-navy dark:border-brand-navyLight">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-brand-gold flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-brand-gold" />
              Counter Dispatch
            </span>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-brand-gold/15 text-brand-navy font-bold border border-brand-gold/40 dark:text-brand-gold">
              {waitingCount} waiting
            </span>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight text-brand-navy dark:text-white">
            Call Next Customer
          </h2>
          <p className="text-xs text-brand-navy/70 dark:text-brand-platinum/70 mt-1 leading-relaxed">
            Atomically summons the first customer in sequence. Plays counter acoustic chime and updates display.
          </p>
        </div>

        {/* Primary Call Action Button */}
        <div className="my-6">
          <Button
            size="xl"
            variant="hero"
            disabled={calling || waitingCount === 0}
            onClick={handleCallNext}
            className="w-full flex items-center justify-center gap-2.5 text-base font-extrabold shadow-gold"
          >
            <Megaphone className={cn("w-5 h-5", calling ? "animate-spin" : "")} />
            <span>{calling ? "Calling Token..." : "CALL NEXT CUSTOMER"}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <div className="mt-2 text-center text-[11px] text-brand-navy/50 dark:text-brand-platinum/50 flex items-center justify-center gap-1.5">
            <span>Quick shortcut:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-brand-platinum border border-brand-platinum text-[10px] font-mono font-bold text-brand-navy">
              Alt + N
            </kbd>
          </div>
        </div>

        {/* Next Up Preview */}
        <div className="p-3 rounded-lg bg-brand-platinumLight border border-brand-platinum flex items-center justify-between dark:bg-brand-navyDark dark:border-brand-navyLight">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-brand-navy/50 dark:text-brand-platinum/50" />
            <span className="text-xs text-brand-navy/70 font-semibold dark:text-brand-platinum/70">Next in line:</span>
          </div>
          {nextUp ? (
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-brand-gold">
                {nextUp.tokenNumber}
              </span>
              <span className="text-xs text-brand-navy font-bold truncate max-w-[140px] dark:text-white">
                {nextUp.customerName}
              </span>
            </div>
          ) : (
            <span className="text-xs text-brand-navy/40 italic dark:text-brand-platinum/40">Queue is clear</span>
          )}
        </div>
      </div>

      {/* Currently Serving Spotlight Card (7 columns) */}
      <div className="lg:col-span-7 rounded-xl border border-brand-platinum bg-white p-6 shadow-card flex flex-col justify-between dark:bg-brand-navy dark:border-brand-navyLight">
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-brand-platinum pb-3 dark:border-brand-navyLight">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-white">
                Currently Serving
              </span>
              {currentlyServing && (
                <StatusBadge status={currentlyServing.status} size="sm" />
              )}
            </div>

            {currentlyServing && (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-gold/15 border border-brand-gold/40 text-brand-navy font-mono font-bold text-xs dark:text-brand-gold">
                <Clock className="w-3.5 h-3.5 text-brand-gold" />
                <span>Elapsed: {timerFormatted}</span>
              </div>
            )}
          </div>

          {currentlyServing ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-brand-gold">
                    {currentlyServing.tokenNumber}
                  </div>
                  <div className="text-lg font-bold text-brand-navy dark:text-white mt-0.5">
                    {currentlyServing.customerName}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-1 text-xs text-brand-navy/70 bg-brand-platinumLight p-2.5 rounded-lg border border-brand-platinum dark:bg-brand-navyDark dark:border-brand-navyLight dark:text-brand-platinum">
                  {currentlyServing.phone && (
                    <div className="flex items-center gap-1.5 font-semibold text-brand-navy dark:text-white">
                      <Phone className="w-3 h-3 text-brand-gold" />
                      <span>{currentlyServing.phone}</span>
                    </div>
                  )}
                  {currentlyServing.email && (
                    <div className="text-[11px] truncate max-w-[200px]">
                      {currentlyServing.email}
                    </div>
                  )}
                  {!currentlyServing.phone && !currentlyServing.email && (
                    <div className="italic text-brand-navy/40">No contact provided</div>
                  )}
                </div>
              </div>

              {currentlyServing.notes && (
                <div className="p-3 rounded-lg bg-brand-platinumLight border border-brand-platinum text-xs text-brand-navy flex items-start gap-2 dark:bg-brand-navyDark dark:border-brand-navyLight dark:text-brand-platinum">
                  <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5 text-brand-gold" />
                  <p className="line-clamp-2">{currentlyServing.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center text-brand-navy/40 dark:text-brand-platinum/40">
              <div className="w-10 h-10 rounded-xl bg-brand-platinum flex items-center justify-center mb-2.5 dark:bg-brand-navyDark">
                <Sparkles className="w-5 h-5 text-brand-gold" />
              </div>
              <h3 className="text-sm font-bold text-brand-navy dark:text-white">
                No Customer Active
              </h3>
              <p className="text-xs text-brand-navy/60 max-w-xs mt-1 dark:text-brand-platinum/60">
                Click "Call Next Customer" or select a ticket from the waiting roster to begin service.
              </p>
            </div>
          )}
        </div>

        {/* Counter Action Controls */}
        {currentlyServing && (
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              {currentlyServing.status === "CALLED" && (
                <Button
                  size="sm"
                  variant="default"
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
                  variant="success"
                  disabled={acting}
                  onClick={handleCompleteService}
                  className="gap-1.5"
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
