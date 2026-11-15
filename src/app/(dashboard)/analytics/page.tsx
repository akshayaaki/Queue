"use client";

import React, { useState, useEffect } from "react";
import { AnalyticsOverview, QueueSummary } from "@/types";
import { KpiCard } from "@/components/analytics/kpi-card";
import {
  CustomerTrafficChart,
  WaitTimeTrendsChart,
  QueueComparisonChart,
  ServiceEfficiencyChart,
} from "@/components/analytics/charts";
import {
  BarChart3,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  TrendingUp,
  RefreshCw,
  Filter,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [queues, setQueues] = useState<QueueSummary[]>([]);
  const [selectedQueueId, setSelectedQueueId] = useState<string>("");
  const [period, setPeriod] = useState<"today" | "7days" | "30days" | "all">("7days");
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/analytics", window.location.origin);
      url.searchParams.set("period", period);
      if (selectedQueueId) {
        url.searchParams.set("queueId", selectedQueueId);
      }

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.data) {
        setOverview(data.data);
      }
    } catch (err) {
      console.error("[Analytics Fetch Error]:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/queues")
      .then((r) => r.json())
      .then((d) => {
        if (d.queues) setQueues(d.queues);
      });
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [period, selectedQueueId]);

  return (
    <div className="space-y-8">
      {/* Page Header & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl border border-border bg-card shadow-card">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <BarChart3 className="w-4 h-4" />
            Operational Intelligence
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Analytics & Queue Telemetry
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Aggregated wait times, service durations, and throughput metrics calculated from real persisted records.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Queue Selector */}
          <div className="w-48">
            <select
              value={selectedQueueId}
              onChange={(e) => setSelectedQueueId(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30 focus-visible:border-blue-600 transition-all shadow-xs"
            >
              <option value="">All My Queues</option>
              {queues.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.name} ({q.queueCode})
                </option>
              ))}
            </select>
          </div>

          {/* Period Selector Pills */}
          <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1 border border-border">
            {(["today", "7days", "30days", "all"] as const).map((p) => {
              const labels = {
                today: "Today",
                "7days": "7 Days",
                "30days": "30 Days",
                all: "All Time",
              };
              return (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    period === p
                      ? "bg-card text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        <KpiCard
          title="Total Served"
          value={overview?.totalServed ?? 0}
          subtitle="Completed customers"
          icon={CheckCircle2}
          badge="Verified"
          trend="up"
        />
        <KpiCard
          title="Now Waiting"
          value={overview?.currentWaiting ?? 0}
          subtitle="Real-time count"
          icon={Users}
          badge="Active"
        />
        <KpiCard
          title="Avg Wait Time"
          value={formatDuration(overview?.avgWaitTimeMs)}
          subtitle="Called - Created"
          icon={Clock}
        />
        <KpiCard
          title="Avg Service"
          value={formatDuration(overview?.avgServiceTimeMs)}
          subtitle="Start to Finish"
          icon={Activity}
        />
        <KpiCard
          title="Cancelled"
          value={overview?.totalCancelled ?? 0}
          subtitle="Departed queue"
          icon={XCircle}
        />
        <KpiCard
          title="Completion Rate"
          value={`${overview?.completionRate ?? 0}%`}
          subtitle="Efficiency metric"
          icon={TrendingUp}
          trend="up"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A: Customer Traffic by Hour */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Customer Traffic by Hour
              </h2>
              <p className="text-xs text-muted-foreground">
                Distribution of queue token arrivals across operating hours.
              </p>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
              Hourly Influx
            </span>
          </div>
          <CustomerTrafficChart data={overview?.hourlyTraffic || []} />
        </div>

        {/* Chart B: Average Wait Time Trends */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Average Waiting Time Trends
              </h2>
              <p className="text-xs text-muted-foreground">
                Daily average minutes from arrival until customer was called.
              </p>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800">
              Speed Trend
            </span>
          </div>
          <WaitTimeTrendsChart data={overview?.waitTimeTrends || []} />
        </div>

        {/* Chart C: Queue Performance Comparison */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Queue Volume Breakdown
              </h2>
              <p className="text-xs text-muted-foreground">
                Comparison of served, active waiting, and cancelled tokens per queue.
              </p>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Counter Comparison
            </span>
          </div>
          <QueueComparisonChart data={overview?.queueComparisons || []} />
        </div>

        {/* Chart D: Service Efficiency */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Counter Service Efficiency
              </h2>
              <p className="text-xs text-muted-foreground">
                Average service duration and total customers served per hour.
              </p>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
              Throughput
            </span>
          </div>
          <ServiceEfficiencyChart data={overview?.serviceEfficiency || []} />
        </div>
      </div>
    </div>
  );
}
