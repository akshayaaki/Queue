"use client";

import React from "react";
import Link from "next/link";
import { QueueSummary } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Users,
  Clock,
  ArrowRight,
  Edit2,
  Trash2,
  PlusCircle,
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
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case "PAUSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Paused
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Inactive
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-card-hover hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group dark:bg-slate-900 dark:border-slate-800">
      <div>
        {/* Header: Code & Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-100 text-slate-800 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
              {queue.queueCode}
            </span>
            {getStatusBadge()}
          </div>

          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(queue)}
              title="Edit Queue"
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(queue.id)}
              title="Delete Queue"
              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors dark:hover:bg-rose-950/40"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 transition-colors">
          {queue.name}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
          {queue.description || "No department description provided."}
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 py-3.5 my-3 border-y border-slate-100 text-center dark:border-slate-800">
          <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/40">
            <div className="text-xl font-bold font-mono text-amber-700 dark:text-amber-400">
              {metrics.waitingCount}
            </div>
            <div className="text-[10px] uppercase font-semibold text-amber-800/80 tracking-wider">
              Waiting
            </div>
          </div>

          <div className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/40">
            <div className="text-xl font-bold font-mono text-indigo-700 dark:text-indigo-400">
              {metrics.servingCount}
            </div>
            <div className="text-[10px] uppercase font-semibold text-indigo-800/80 tracking-wider">
              Serving
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-700/60">
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              {metrics.completedCount}
            </div>
            <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
              Served
            </div>
          </div>
        </div>

        {/* Average wait time notice */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Avg Wait:</span>
          </div>
          <span className="font-mono font-medium text-slate-900 dark:text-slate-200">
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
          className="flex-1 gap-1.5 text-xs font-semibold"
        >
          <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
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
