import React from "react";
import Link from "next/link";
import { QueueSummary } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Users,
  Clock,
  ArrowRight,
  PlusCircle,
  Edit2,
  Trash2,
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
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-fern/15 text-brand-forest border border-brand-fern/40">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-fern" />
            Active
          </span>
        );
      case "PAUSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-sage/25 text-brand-forest border border-brand-sage">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-sage" />
            Paused
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-brand-stone/40 text-brand-forest/60 border border-brand-stone">
            Inactive
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-brand-stone bg-white p-5 shadow-card hover:shadow-card-hover hover:border-brand-fern/60 transition-all duration-200 flex flex-col justify-between group dark:bg-brand-forest dark:border-brand-pine">
      <div>
        {/* Header: Code & Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded font-mono font-bold text-xs bg-brand-forest text-brand-stone border border-brand-pine dark:bg-brand-pine">
              {queue.queueCode}
            </span>
            {getStatusBadge()}
          </div>

          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(queue)}
              title="Edit Queue"
              className="p-1 rounded text-brand-forest/50 hover:text-brand-forest hover:bg-brand-platinumLight transition-colors dark:text-brand-stone/50 dark:hover:bg-brand-pine dark:hover:text-white"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(queue.id)}
              title="Delete Queue"
              className="p-1 rounded text-brand-forest/50 hover:text-rose-600 hover:bg-rose-50 transition-colors dark:hover:bg-rose-950/40"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-extrabold text-brand-forest dark:text-white tracking-tight group-hover:text-brand-fern transition-colors">
          {queue.name}
        </h3>
        <p className="text-xs text-brand-forest/70 dark:text-brand-stone/70 mt-1 line-clamp-2 min-h-[32px]">
          {queue.description || "No department description provided."}
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 py-3.5 my-3 border-y border-brand-stone text-center dark:border-brand-pine">
          <div className="p-2 rounded-lg bg-brand-sage/20 border border-brand-sage/40">
            <div className="text-xl font-black font-mono text-brand-forest dark:text-brand-stone">
              {metrics.waitingCount}
            </div>
            <div className="text-[10px] uppercase font-bold text-brand-forest/80 tracking-wider dark:text-brand-stone/80">
              Waiting
            </div>
          </div>

          <div className="p-2 rounded-lg bg-brand-pine text-white border border-brand-forest">
            <div className="text-xl font-black font-mono text-white">
              {metrics.servingCount}
            </div>
            <div className="text-[10px] uppercase font-bold text-brand-stone tracking-wider">
              Serving
            </div>
          </div>

          <div className="p-2 rounded-lg bg-brand-platinumLight border border-brand-stone dark:bg-brand-forest dark:border-brand-pine">
            <div className="text-xl font-black font-mono text-brand-forest dark:text-white">
              {metrics.completedCount}
            </div>
            <div className="text-[10px] uppercase font-bold text-brand-forest/60 tracking-wider dark:text-brand-stone/60">
              Served
            </div>
          </div>
        </div>

        {/* Average wait time notice */}
        <div className="flex items-center justify-between text-xs text-brand-forest/70 mb-4 dark:text-brand-stone/70">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-fern" />
            <span className="font-medium">Avg Wait:</span>
          </div>
          <span className="font-mono font-bold text-brand-forest dark:text-white">
            {formatDuration(metrics.avgWaitTimeMs)}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onAddCustomer(queue)}
          className="flex-1 gap-1.5 text-xs font-bold"
        >
          <PlusCircle className="w-3.5 h-3.5 text-brand-fern" />
          Add Customer
        </Button>
        <Button size="sm" variant="default" asChild className="flex-1 font-bold">
          <Link href={`/queues/${queue.id}`} className="flex items-center justify-center gap-1 text-xs">
            <span>Manage</span>
            <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
