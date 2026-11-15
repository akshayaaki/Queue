"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { QueueDetail, TokenItem } from "@/types";
import { CallNextHero } from "@/components/tokens/call-next-hero";
import { LiveTokenTable } from "@/components/tokens/live-token-table";
import { AddCustomerModal } from "@/components/tokens/add-customer-modal";
import { CancelTokenModal } from "@/components/tokens/cancel-token-modal";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  UserPlus,
  RefreshCw,
  Clock,
  Layers,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function LiveQueuePage() {
  const params = useParams();
  const router = useRouter();
  const queueId = params.id as string;

  const [queue, setQueue] = useState<QueueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [tokenToCancel, setTokenToCancel] = useState<TokenItem | null>(null);

  const fetchQueueData = async () => {
    if (!queueId) return;
    try {
      const res = await fetch(`/api/queues/${queueId}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Queue not found or unauthorized access.");
        }
        throw new Error("Failed to load queue details.");
      }
      const data = await res.json();
      setQueue(data.queue);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueData();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/events?queueId=${queueId}`);
      eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.type === "CONNECTED") return;
          fetchQueueData();
        } catch {}
      };
      eventSource.onerror = () => {
        eventSource?.close();
      };
    } catch {}

    const interval = setInterval(fetchQueueData, 5000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, [queueId]);

  const handleOpenCancelModal = (token: TokenItem) => {
    setTokenToCancel(token);
    setCancelModalOpen(true);
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 text-brand-fern animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-foreground">Connecting to Live Queue...</p>
      </div>
    );
  }

  if (error || !queue) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center rounded-2xl border border-border bg-card shadow-card">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-foreground">Unable to Open Queue</h2>
        <p className="text-xs text-muted-foreground mt-1 mb-5">{error || "Queue not found"}</p>
        <Button asChild variant="outline">
          <Link href="/queues">Return to Queues</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild className="h-9 px-2.5">
            <Link href="/queues">
              <ChevronLeft className="w-4 h-4 mr-1" />
              All Queues
            </Link>
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-brand-forest text-brand-stone font-mono font-bold text-xs border border-brand-pine shadow-2xs">
                {queue.queueCode}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {queue.name}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-fern/15 text-brand-forest border border-brand-fern/40">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-fern animate-pulse" />
                Live
              </span>
            </div>
            {queue.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{queue.description}</p>
            )}
          </div>
        </div>

        {/* Quick Add Customer Trigger */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setAddCustomerOpen(true)}
            variant="default"
            size="sm"
            className="gap-2 font-bold shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Customer</span>
          </Button>
        </div>
      </div>

      {/* Hero Call Next Action + Currently Serving Card */}
      <CallNextHero
        queueId={queue.id}
        currentlyServing={queue.currentlyServing}
        nextUp={queue.nextUp}
        waitingCount={queue.metrics?.waitingCount ?? 0}
        onActionComplete={fetchQueueData}
        onOpenCancelModal={handleOpenCancelModal}
      />

      {/* Live Token Sequence Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold tracking-tight text-foreground font-serif">
            Live Token Sequence & Roster
          </h2>
          <span className="text-xs text-muted-foreground">
            Synchronized via real-time SSE stream
          </span>
        </div>

        <LiveTokenTable
          queueId={queue.id}
          tokens={queue.tokens}
          onRefresh={fetchQueueData}
          onOpenCancelModal={handleOpenCancelModal}
        />
      </div>

      {/* Modals */}
      <AddCustomerModal
        open={addCustomerOpen}
        onOpenChange={setAddCustomerOpen}
        queueId={queue.id}
        queueCode={queue.queueCode}
        nextTokenNumber={queue.nextTokenNumber}
        onCustomerAdded={fetchQueueData}
      />

      <CancelTokenModal
        token={tokenToCancel}
        open={cancelModalOpen}
        onOpenChange={setCancelModalOpen}
        onCancelled={fetchQueueData}
      />
    </div>
  );
}
