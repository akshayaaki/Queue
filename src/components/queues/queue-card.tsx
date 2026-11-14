"use client";

import React from "react";
import Link from "next/link";
import { QueueSummary } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Users,
  Clock,
  ArrowRight,
  MoreVertical,
  Edit2,
  Trash2,
  PlusCircle,
  Activity,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface QueueCardProps {
  queue: QueueSummary;
  onEdit: (queue: QueueSummary) => void;
  onDelete: (queueId: string) => void;
  onAddCustomer: (queue: QueueSummary) => void;
}

export function QueueCard({
  queue,
  onEdit,
  onDelete,
  onAddCustomer,
}: QueueCardProps) {
  const metrics = queue.metrics || {
    waitingCount: 0,
    servingCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    avgWaitTimeMs: 0,
  };

  const getStatusBadge = () => {
    switch (queue.status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-palette-celery text-[#2D3F1D] border border-palette-sage dark:bg-palette-sage/20 dark:text-[#D1E2A5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#586938]" />
            Active
          </span>
        );
      case "PAUSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Paused
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
            Inactive
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-bespoke hover:shadow-bespoke-hover transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Header: Code & Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-palette-bisque text-palette-charcoal font-mono font-bold text-xs border border-palette-ochre/30 shadow-2xs dark:bg-palette-ochre/20 dark:text-palette-ochre">
              {queue.queueCode}
            </span>
            {getStatusBadge()}
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(queue)}
              title="Edit Queue"
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(queue.id)}
              title="Delete Queue"
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-bold text-foreground tracking-tight group-hover:text-palette-ochreDark transition-colors">
          {queue.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 min-h-[32px]">
          {queue.description || "No description provided."}
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 py-4 my-3 border-y border-border/70 text-center">
          <div className="p-2 rounded-xl bg-palette-bisque/30 dark:bg-palette-ochre/10">
            <div className="text-xl font-bold font-mono text-palette-ochreDark dark:text-palette-ochre">
              {metrics.waitingCount}
            </div>
            <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Waiting
            </div>
          </div>

          <div className="p-2 rounded-xl bg-palette-celery/30 dark:bg-palette-sage/10">
            <div className="text-xl font-bold font-mono text-[#405624] dark:text-[#C5D5A0]">
              {metrics.servingCount}
            </div>
            <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Serving
            </div>
          </div>

          <div className="p-2 rounded-xl bg-muted/40">
            <div className="text-xl font-bold font-mono text-foreground">
              {metrics.completedCount}
            </div>
            <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Served
            </div>
          </div>
        </div>

        {/* Average wait time notice */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-palette-ochreDark" />
            <span>Avg Wait:</span>
          </div>
          <span className="font-mono font-medium text-foreground">
            {formatDuration(metrics.avgWaitTimeMs)}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2 pt-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onAddCustomer(queue)}
          className="flex-1 gap-1.5 text-xs font-semibold"
        >
          <PlusCircle className="w-3.5 h-3.5 text-palette-ochreDark" />
          Add Customer
        </Button>
        <Button size="sm" variant="default" asChild className="flex-1">
          <Link href={`/queues/${queue.id}`} className="flex items-center justify-center gap-1 text-xs font-semibold">
            <span>Manage</span>
            <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
