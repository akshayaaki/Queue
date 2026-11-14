"use client";

import React, { useState, useEffect } from "react";
import { TokenItem, QueueSummary } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, History, Calendar, Clock, Download } from "lucide-react";
import { formatTime, formatDateTime, formatDuration, calculateWaitTimeMs, calculateServiceTimeMs } from "@/lib/utils";

export default function TokenHistoryPage() {
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [queues, setQueues] = useState<QueueSummary[]>([]);
  const [selectedQueueId, setSelectedQueueId] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const queuesRes = await fetch("/api/queues").then((r) => r.json());

      if (queuesRes.queues) {
        setQueues(queuesRes.queues);

        // Fetch tokens across all queues
        const allTokensPromises = queuesRes.queues.map((q: QueueSummary) =>
          fetch(`/api/queues/${q.id}/tokens`).then((r) => r.json())
        );

        const results = await Promise.all(allTokensPromises);
        const aggregated: TokenItem[] = [];
        results.forEach((res) => {
          if (res.tokens) {
            aggregated.push(...res.tokens);
          }
        });

        // Sort by createdAt descending
        aggregated.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setTokens(aggregated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTokens = tokens.filter((t) => {
    const matchesQueue = selectedQueueId === "ALL" || t.queueId === selectedQueueId;
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchesSearch =
      t.tokenNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (t.phone && t.phone.includes(search)) ||
      (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()));

    return matchesQueue && matchesStatus && matchesSearch;
  });

  const exportCSV = () => {
    const headers = ["Token", "Customer", "Phone", "Email", "Status", "Created At", "Called At", "Completed At", "Notes", "Cancellation Reason"];
    const rows = filteredTokens.map((t) => [
      t.tokenNumber,
      `"${t.customerName.replace(/"/g, '""')}"`,
      t.phone || "",
      t.email || "",
      t.status,
      new Date(t.createdAt).toISOString(),
      t.calledAt ? new Date(t.calledAt).toISOString() : "",
      t.completedAt ? new Date(t.completedAt).toISOString() : "",
      `"${(t.notes || "").replace(/"/g, '""')}"`,
      `"${(t.cancellationReason || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `queueflow_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-serif">
            Token History & Audit Records
          </h1>
          <p className="text-xs text-muted-foreground">
            Immutable lifecycle ledger of issued, served, and cancelled customer tokens.
          </p>
        </div>

        <Button
          onClick={exportCSV}
          variant="outline"
          size="sm"
          className="gap-2 text-xs font-semibold"
          disabled={filteredTokens.length === 0}
        >
          <Download className="w-3.5 h-3.5" />
          Export Audit CSV
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search token #, customer, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Queue Filter */}
          <div>
            <select
              value={selectedQueueId}
              onChange={(e) => setSelectedQueueId(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-palette-ochre"
            >
              <option value="ALL">All Queues</option>
              {queues.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.name} ({q.queueCode})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-palette-ochre"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="SERVING">Serving</option>
              <option value="CALLED">Called</option>
              <option value="WAITING">Waiting</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="SKIPPED">Skipped</option>
            </select>
          </div>
        </div>
      </div>

      {/* Historical Ledger Table */}
      <div className="rounded-2xl border border-border bg-card shadow-bespoke overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                <th className="py-3 px-4">Token #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">Called At</th>
                <th className="py-3 px-4">Completed / Outcome</th>
                <th className="py-3 px-4">Notes & Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredTokens.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <History className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm font-medium">No token records match your query</p>
                  </td>
                </tr>
              ) : (
                filteredTokens.map((t) => {
                  const waitMs = calculateWaitTimeMs(t.createdAt, t.calledAt);
                  const svcMs = calculateServiceTimeMs(t.serviceStartedAt, t.completedAt);

                  return (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-foreground">
                        {t.tokenNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground text-xs sm:text-sm">
                          {t.customerName}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {t.phone || t.email || "No contact"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={t.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-muted-foreground">
                        {formatDateTime(t.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-muted-foreground">
                        {t.calledAt ? (
                          <div>
                            <div>{formatTime(t.calledAt)}</div>
                            <div className="text-[10px] text-palette-ochreDark">
                              waited {formatDuration(waitMs)}
                            </div>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-muted-foreground">
                        {t.completedAt ? (
                          <div>
                            <div>{formatTime(t.completedAt)}</div>
                            {svcMs !== null && (
                              <div className="text-[10px] text-[#586938]">
                                served in {formatDuration(svcMs)}
                              </div>
                            )}
                          </div>
                        ) : t.cancelledAt ? (
                          <div className="text-red-600 font-medium">
                            Cancelled at {formatTime(t.cancelledAt)}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground max-w-xs">
                        {t.cancellationReason && (
                          <span className="text-red-700 font-medium block">
                            Cancelled: {t.cancellationReason}
                          </span>
                        )}
                        {t.notes && <span className="italic">"{t.notes}"</span>}
                        {!t.cancellationReason && !t.notes && "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
