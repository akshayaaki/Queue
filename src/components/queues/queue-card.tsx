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
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case "PAUSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-gold/20 text-brand-navy border border-brand-gold/40">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
            Paused
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-brand-platinum text-brand-navy/60 border border-brand-platinum">
            Inactive
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-brand-platinum bg-white p-5 shadow-card hover:shadow-card-hover hover:border-brand-gold/60 transition-all duration-200 flex flex-col justify-between group dark:bg-brand-navy dark:border-brand-navyLight">
      <div>
        {/* Header: Code & Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded font-mono font-bold text-xs bg-brand-navy text-brand-gold border border-brand-navyDark dark:bg-brand-navyDark">
              {queue.queueCode}
            </span>
            {getStatusBadge()}
          </div>

          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(queue)}
              title="Edit Queue"
              className="p-1 rounded text-brand-navy/50 hover:text-brand-navy hover:bg-brand-platinumLight transition-colors dark:text-brand-platinum/50 dark:hover:bg-brand-navyLight dark:hover:text-white"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(queue.id)}
              title="Delete Queue"
              className="p-1 rounded text-brand-navy/50 hover:text-rose-600 hover:bg-rose-50 transition-colors dark:hover:bg-rose-950/40"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-extrabold text-brand-navy dark:text-white tracking-tight group-hover:text-brand-gold transition-colors">
          {queue.name}
        </h3>
        <p className="text-xs text-brand-navy/70 dark:text-brand-platinum/70 mt-1 line-clamp-2 min-h-[32px]">
          {queue.description || "No department description provided."}
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 py-3.5 my-3 border-y border-brand-platinum text-center dark:border-brand-navyLight">
          <div className="p-2 rounded-lg bg-brand-gold/15 border border-brand-gold/40">
            <div className="text-xl font-black font-mono text-brand-navy dark:text-brand-gold">
              {metrics.waitingCount}
            </div>
            <div className="text-[10px] uppercase font-bold text-brand-navy/80 tracking-wider dark:text-brand-gold/80">
              Waiting
            </div>
          </div>

          <div className="p-2 rounded-lg bg-brand-navy text-white border border-brand-navyDark">
            <div className="text-xl font-black font-mono text-brand-gold">
              {metrics.servingCount}
            </div>
            <div className="text-[10px] uppercase font-bold text-brand-platinum tracking-wider">
              Serving
            </div>
          </div>

          <div className="p-2 rounded-lg bg-brand-platinumLight border border-brand-platinum dark:bg-brand-navyDark dark:border-brand-navyLight">
            <div className="text-xl font-black font-mono text-brand-navy dark:text-white">
              {metrics.completedCount}
            </div>
            <div className="text-[10px] uppercase font-bold text-brand-navy/60 tracking-wider dark:text-brand-platinum/60">
              Served
            </div>
          </div>
        </div>

        {/* Average wait time notice */}
        <div className="flex items-center justify-between text-xs text-brand-navy/70 mb-4 dark:text-brand-platinum/70">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-gold" />
            <span className="font-medium">Avg Wait:</span>
          </div>
          <span className="font-mono font-bold text-brand-navy dark:text-white">
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
          <PlusCircle className="w-3.5 h-3.5 text-brand-gold" />
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
