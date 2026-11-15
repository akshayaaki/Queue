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
  RotateCcw,
  XCircle,
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

          if (payload.type === "TOKEN_CALLED") {
            playCallChime();
          }

          onRefresh();
        } catch (err) {
          console.debug("[SSE] Parse error", err);
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();
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

  // Filter and sort tokens
  const filteredTokens = (tokens || []).filter((t) => {
    const matchesStatus =
      statusFilter === "ALL" ? true : t.status === statusFilter;
    const matchesSearch =
      t.tokenNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (t.phone && t.phone.includes(search));
    return matchesStatus && matchesSearch;
  });

  const FILTERS = ["ALL", "WAITING", "SERVING", "CALLED", "COMPLETED", "CANCELLED", "SKIPPED"];

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:bg-slate-900 dark:border-slate-800">
      {/* Controls Bar: Search + Status Filter Pills */}
      <div className="p-4 border-b border-slate-200 bg-white flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between dark:bg-slate-900 dark:border-slate-800">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search token # or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Status:
          </span>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === f
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
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
            <tr className="border-b border-slate-200 bg-slate-50/60 text-[11px] uppercase tracking-wider text-slate-500 font-semibold dark:bg-slate-800/40 dark:border-slate-800">
              <th className="py-3 px-4 w-16 text-center">Order</th>
              <th className="py-3 px-4">Token</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4 hidden sm:table-cell">Joined At</th>
              <th className="py-3 px-4">Wait Time</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTokens.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <Filter className="w-7 h-7 text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      No tokens match your current filter
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try adjusting the search query or status filter.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTokens.map((t) => {
                const isWaiting = t.status === "WAITING";
                const waitMs = calculateWaitTimeMs(t.createdAt, t.calledAt);
                const serviceMs = calculateServiceTimeMs(t.serviceStartedAt, t.completedAt);

                return (
                  <tr
                    key={t.id}
                    className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                  >
                    {/* Position & Reorder Buttons */}
                    <td className="py-3 px-4 text-center">
                      {isWaiting ? (
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-mono font-bold text-xs text-slate-400 w-4 text-center">
                            #{t.position}
                          </span>
                          <div className="flex flex-col">
                            <button
                              title="Move Up in Queue"
                              disabled={reorderingId !== null || t.position === 1}
                              onClick={() => handleReorder(t.id, "UP")}
                              className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-800 disabled:opacity-20 transition-colors"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              title="Move Down in Queue"
                              disabled={reorderingId !== null}
                              onClick={() => handleReorder(t.id, "DOWN")}
                              className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-800 disabled:opacity-20 transition-colors"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 font-mono">—</span>
                      )}
                    </td>

                    {/* Token Number */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-sm text-slate-900 dark:text-white tracking-tight">
                        {t.tokenNumber}
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 dark:text-white text-sm">
                        {t.customerName}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        {t.phone && <span>{t.phone}</span>}
                        {t.phone && t.email && <span>•</span>}
                        {t.email && <span className="truncate max-w-[140px]">{t.email}</span>}
                      </div>
                      {t.notes && (
                        <div className="text-[11px] text-slate-400 italic mt-0.5 line-clamp-1">
                          "{t.notes}"
                        </div>
                      )}
                    </td>

                    {/* Joined At */}
                    <td className="py-3 px-4 hidden sm:table-cell text-xs text-slate-500 font-mono">
                      {formatTime(t.createdAt)}
                    </td>

                    {/* Wait Time */}
                    <td className="py-3 px-4">
                      <div className="font-mono text-xs text-slate-900 dark:text-slate-200 font-medium">
                        {formatDuration(waitMs)}
                      </div>
                      {serviceMs !== null && (
                        <div className="text-[10px] text-slate-400 font-mono">
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
                            variant="default"
                            onClick={() => handleStartService(t.id)}
                            className="h-7 text-xs px-2.5 gap-1"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            Serve
                          </Button>
                        )}

                        {t.status === "SERVING" && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleCompleteService(t.id)}
                            className="h-7 text-xs px-2.5 gap-1"
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
                            className="h-7 text-xs px-2.5 gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Recall
                          </Button>
                        )}

                        {isWaiting && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onOpenCancelModal(t)}
                            className="h-7 text-xs px-2.5"
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
