"use client";

import React, { useState, useEffect } from "react";
import { TokenItem } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Play,
  CheckCircle2,
  FastForward,
  RotateCcw,
  XCircle,
  Clock,
  MoreVertical,
  Megaphone,
} from "lucide-react";
import { formatTime, formatDuration, calculateWaitTimeMs, calculateServiceTimeMs } from "@/lib/utils";
import { playCallChime } from "@/components/audio/chime";
import { toast } from "sonner";

interface LiveTokenTableProps {
  queueId: string;
  tokens: TokenItem[];
  onRefresh: () => void;
  onOpenCancelModal: (token: TokenItem) => void;
}

export function LiveTokenTable({
  queueId,
  tokens,
  onRefresh,
  onOpenCancelModal,
}: LiveTokenTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  // Real-time Server-Sent Events (SSE) Listener
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let isSubscribed = true;

    try {
      eventSource = new EventSource(`/api/events?queueId=${queueId}`);

      eventSource.onmessage = (e) => {
        if (!isSubscribed) return;
        try {
          const payload = JSON.parse(e.data);
          if (payload.type === "CONNECTED") return;

          // If a token was called remotely, play chime
          if (payload.type === "TOKEN_CALLED") {
            playCallChime();
          }

          // Refresh the queue dataset
          onRefresh();
        } catch (err) {
          console.debug("[SSE] Parse error", err);
        }
      };

      eventSource.onerror = () => {
        // EventSource automatically retries connection
      };
    } catch (err) {
      console.error("[SSE Error]:", err);
    }

    return () => {
      isSubscribed = false;
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [queueId]);

  // Handle Token Reordering
  const handleReorder = async (tokenId: string, direction: "UP" | "DOWN") => {
    try {
      setReorderingId(tokenId);
      const res = await fetch(`/api/queues/${queueId}/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId, direction }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to reorder token");
      }

      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to reorder token");
    } finally {
      setReorderingId(null);
    }
  };

  // Quick Action Handlers
  const handleStartService = async (tokenId: string) => {
    try {
      const res = await fetch(`/api/tokens/${tokenId}/start-service`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to start service");
      toast.success("Service started");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCompleteService = async (tokenId: string) => {
    try {
      const res = await fetch(`/api/tokens/${tokenId}/complete`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to complete service");
      toast.success("Service completed");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRecall = async (tokenId: string) => {
    try {
      const res = await fetch(`/api/tokens/${tokenId}/recall`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to recall token");
      playCallChime();
      toast.success("Token re-called to counter");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSkip = async (tokenId: string) => {
    try {
      const res = await fetch(`/api/tokens/${tokenId}/skip`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to skip token");
      toast.info("Token marked as skipped");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Filter and sort tokens
  const filteredTokens = tokens.filter((t) => {
    const matchesStatus =
      statusFilter === "ALL" ? true : t.status === statusFilter;
    const matchesSearch =
      t.tokenNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (t.phone && t.phone.includes(search));
    return matchesStatus && matchesSearch;
  });

  const waitingTokens = filteredTokens.filter((t) => t.status === "WAITING");
  const otherTokens = filteredTokens.filter((t) => t.status !== "WAITING");

  // Filter buttons list
  const FILTERS = ["ALL", "WAITING", "SERVING", "CALLED", "COMPLETED", "CANCELLED", "SKIPPED"];

  return (
    <div className="rounded-2xl border border-border bg-card shadow-bespoke overflow-hidden">
      {/* Controls Bar: Search + Status Filter Pills */}
      <div className="p-4 sm:p-5 border-b border-border bg-card/60 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search token # or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mr-1 hidden sm:inline">
            Status:
          </span>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === f
                  ? "bg-palette-ochre text-[#221B13] shadow-xs"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {f === "ALL" ? "All Tokens" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Tokens Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              <th className="py-3 px-4 w-16 text-center">Order</th>
              <th className="py-3 px-4">Token</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4 hidden sm:table-cell">Joined At</th>
              <th className="py-3 px-4">Wait Time</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredTokens.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <Filter className="w-8 h-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm font-medium">No tokens match your current filter</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Try adjusting the search query or status filter.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTokens.map((t, idx) => {
                const isWaiting = t.status === "WAITING";
                const waitMs = calculateWaitTimeMs(t.createdAt, t.calledAt);
                const serviceMs = calculateServiceTimeMs(t.serviceStartedAt, t.completedAt);

                return (
                  <tr
                    key={t.id}
                    className={`transition-colors hover:bg-muted/40 ${
                      t.status === "CALLED"
                        ? "bg-palette-parchment/60 dark:bg-palette-ochre/10"
                        : t.status === "SERVING"
                        ? "bg-palette-celery/30 dark:bg-palette-sage/10"
                        : ""
                    }`}
                  >
                    {/* Position & Reorder Buttons */}
                    <td className="py-3 px-4 text-center">
                      {isWaiting ? (
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-mono font-bold text-xs text-muted-foreground w-4 text-center">
                            #{t.position}
                          </span>
                          <div className="flex flex-col">
                            <button
                              title="Move Up in Queue"
                              disabled={reorderingId !== null || t.position === 1}
                              onClick={() => handleReorder(t.id, "UP")}
                              className="p-1 rounded hover:bg-palette-bisque text-muted-foreground hover:text-palette-ochreDark disabled:opacity-20 transition-colors"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              title="Move Down in Queue"
                              disabled={reorderingId !== null}
                              onClick={() => handleReorder(t.id, "DOWN")}
                              className="p-1 rounded hover:bg-palette-bisque text-muted-foreground hover:text-palette-ochreDark disabled:opacity-20 transition-colors"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/40 font-mono">—</span>
                      )}
                    </td>

                    {/* Token Number */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-sm sm:text-base text-foreground tracking-tight">
                        {t.tokenNumber}
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground text-sm">
                        {t.customerName}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        {t.phone && <span>{t.phone}</span>}
                        {t.phone && t.email && <span>•</span>}
                        {t.email && <span className="truncate max-w-[140px]">{t.email}</span>}
                      </div>
                      {t.notes && (
                        <div className="text-[11px] text-muted-foreground/80 italic mt-0.5 line-clamp-1">
                          "{t.notes}"
                        </div>
                      )}
                    </td>

                    {/* Joined At */}
                    <td className="py-3 px-4 hidden sm:table-cell text-xs text-muted-foreground font-mono">
                      {formatTime(t.createdAt)}
                    </td>

                    {/* Wait Time */}
                    <td className="py-3 px-4">
                      <div className="font-mono text-xs text-foreground font-medium">
                        {formatDuration(waitMs)}
                      </div>
                      {serviceMs !== null && (
                        <div className="text-[10px] text-muted-foreground font-mono">
                          svc: {formatDuration(serviceMs)}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <StatusBadge status={t.status} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {t.status === "CALLED" && (
                          <Button
                            size="sm"
                            variant="sage"
                            onClick={() => handleStartService(t.id)}
                            className="h-7 text-xs px-2 gap-1"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            Serve
                          </Button>
                        )}

                        {t.status === "SERVING" && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleCompleteService(t.id)}
                            className="h-7 text-xs px-2 gap-1 bg-[#586938] hover:bg-[#45542C] text-white"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Complete
                          </Button>
                        )}

                        {t.status === "SKIPPED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRecall(t.id)}
                            className="h-7 text-xs px-2 gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Recall
                          </Button>
                        )}

                        {isWaiting && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onOpenCancelModal(t)}
                            className="h-7 text-xs px-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
