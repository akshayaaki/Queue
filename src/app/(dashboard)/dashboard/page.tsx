"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  Layers,
  PlusCircle,
  Megaphone,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/analytics/kpi-card";
import { QueueCard } from "@/components/queues/queue-card";
import { CreateQueueModal } from "@/components/queues/create-queue-modal";
import { EditQueueModal } from "@/components/queues/edit-queue-modal";
import { AddCustomerModal } from "@/components/tokens/add-customer-modal";
import { QueueSummary, AnalyticsOverview, QueueEventItem } from "@/types";
import { formatDuration, formatDateTime, formatTime } from "@/lib/utils";
import { playCallChime } from "@/components/audio/chime";
import { toast } from "sonner";

export default function DashboardPage() {
  const [queues, setQueues] = useState<QueueSummary[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [createQueueOpen, setCreateQueueOpen] = useState(false);
  const [editQueueOpen, setEditQueueOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<QueueSummary | null>(null);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [callingNext, setCallingNext] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [queuesRes, analyticsRes] = await Promise.all([
        fetch("/api/queues"),
        fetch("/api/analytics?period=today"),
      ]);

      const queuesData = await queuesRes.json();
      const analyticsData = await analyticsRes.json();

      if (queuesData.queues) {
        setQueues(queuesData.queues);
      }
      if (analyticsData.data) {
        setOverview(analyticsData.data);
      }
    } catch (err) {
      console.error("[Dashboard Fetch Error]:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen to real-time events on global channel
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/events?queueId=*");
      eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.type === "CONNECTED") return;
          // Background refresh
          fetchDashboardData();
        } catch {}
      };
      eventSource.onerror = () => {
        eventSource?.close();
      };
    } catch {}

    const interval = setInterval(fetchDashboardData, 8000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, []);

  const handleQuickCallNext = async (queueId: string) => {
    try {
      setCallingNext(true);
      const res = await fetch(`/api/queues/${queueId}/call-next`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to call next");

      if (data.token) {
        playCallChime();
        toast.success(`Called Token ${data.token.tokenNumber}!`);
      } else {
        toast.info("No waiting customers in this queue");
      }
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCallingNext(false);
    }
  };

  const primaryQueue = queues[0] || null;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-2xl border border-brand-stone bg-white shadow-card dark:border-brand-pine dark:bg-brand-forest">
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-sage/25 border border-brand-sage text-[11px] font-bold text-brand-forest dark:text-brand-stone dark:bg-brand-sage/20">
            <span className="w-2 h-2 rounded-full bg-brand-fern animate-pulse" />
            Live Queue Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-forest dark:text-white">
            Queue Performance Overview
          </h1>
          <p className="text-xs sm:text-sm text-brand-forest/60 max-w-xl dark:text-brand-stone/60">
            Real-time multi-counter status, live token sequence generation, and atomic queue dispatch.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <Button
            variant="outline"
            onClick={() => setCreateQueueOpen(true)}
            className="gap-2 text-xs font-bold"
          >
            <PlusCircle className="w-4 h-4 text-brand-fern" />
            New Queue
          </Button>

          {primaryQueue && (
            <Button
              variant="default"
              disabled={callingNext || (primaryQueue.metrics?.waitingCount ?? 0) === 0}
              onClick={() => handleQuickCallNext(primaryQueue.id)}
              className="gap-2 text-xs font-bold shadow-pine"
            >
              <Megaphone className="w-4 h-4" />
              <span>Call Next ({primaryQueue.queueCode})</span>
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        <KpiCard
          title="Total Served"
          value={overview?.totalServed ?? 0}
          subtitle="Customers Completed"
          icon={CheckCircle2}
          badge="Today"
          trend="up"
        />
        <KpiCard
          title="Now Waiting"
          value={overview?.currentWaiting ?? 0}
          subtitle="Active in Queue"
          icon={Users}
          badge="Live"
          trend="neutral"
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
          subtitle="Removed Tokens"
          icon={XCircle}
        />
        <KpiCard
          title="Completion"
          value={`${overview?.completionRate ?? 0}%`}
          subtitle="Served Ratio"
          icon={TrendingUp}
          badge={overview && overview.completionRate >= 80 ? "Optimal" : "Standard"}
          trend="up"
        />
      </div>

      {/* Active Queues Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-brand-navy dark:text-white">
              Active Queues & Counters
            </h2>
            <p className="text-xs text-brand-navy/60 dark:text-brand-platinum/60">
              Direct counter status, live waiting volume, and queue actions.
            </p>
          </div>
          <Link
            href="/queues"
            className="text-xs font-bold text-brand-navy hover:text-brand-gold hover:underline flex items-center gap-1 dark:text-brand-gold"
          >
            <span>Manage All Queues</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {queues.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-brand-platinum bg-white dark:border-brand-navyLight dark:bg-brand-navy">
            <Layers className="w-10 h-10 text-brand-navy/30 mx-auto mb-3 dark:text-brand-platinum/30" />
            <h3 className="text-base font-bold text-brand-navy dark:text-white">No Queues Configured</h3>
            <p className="text-xs text-brand-navy/60 max-w-sm mx-auto mt-1 mb-4 dark:text-brand-platinum/60">
              Create your first service queue to begin adding customers and issuing numbered tokens.
            </p>
            <Button onClick={() => setCreateQueueOpen(true)} variant="default">
              Create First Queue
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {queues.map((q) => (
              <QueueCard
                key={q.id}
                queue={q}
                onEdit={(queue) => {
                  setSelectedQueue(queue);
                  setEditQueueOpen(true);
                }}
                onDelete={async (queueId) => {
                  if (confirm("Are you sure you want to delete this queue and its records?")) {
                    await fetch(`/api/queues/${queueId}`, { method: "DELETE" });
                    fetchDashboardData();
                  }
                }}
                onAddCustomer={(queue) => {
                  setSelectedQueue(queue);
                  setAddCustomerOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateQueueModal
        open={createQueueOpen}
        onOpenChange={setCreateQueueOpen}
        onQueueCreated={fetchDashboardData}
      />

      <EditQueueModal
        queue={selectedQueue}
        open={editQueueOpen}
        onOpenChange={setEditQueueOpen}
        onQueueUpdated={fetchDashboardData}
      />

      {selectedQueue && (
        <AddCustomerModal
          open={addCustomerOpen}
          onOpenChange={setAddCustomerOpen}
          queueId={selectedQueue.id}
          queueCode={selectedQueue.queueCode}
          nextTokenNumber={selectedQueue.nextTokenNumber}
          onCustomerAdded={fetchDashboardData}
        />
      )}
    </div>
  );
}
