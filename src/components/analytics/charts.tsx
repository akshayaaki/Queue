"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
} from "recharts";

interface TrafficData {
  hour: string;
  count: number;
}

interface WaitTrendData {
  date: string;
  avgWaitMinutes: number;
}

interface QueueCompData {
  queueName: string;
  queueCode: string;
  waiting: number;
  completed: number;
  cancelled: number;
}

interface ServiceEffData {
  hour: string;
  servedCount: number;
  avgDurationMinutes: number;
}

// Custom Tooltip with luxury warm styling
function CustomChartTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-3 shadow-xl text-xs space-y-1">
        <p className="font-bold text-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}:
            </span>
            <span className="font-mono font-bold text-foreground">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function CustomerTrafficChart({ data }: { data: TrafficData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-muted-foreground italic">
        No traffic recorded during this period
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomChartTooltip />} />
          <Bar
            dataKey="count"
            name="Tokens Created"
            fill="#D4A373"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WaitTimeTrendsChart({ data }: { data: WaitTrendData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-muted-foreground italic">
        Insufficient historical wait time records
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="waitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#CCD5AE" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#CCD5AE" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            unit="m"
          />
          <Tooltip content={<CustomChartTooltip />} />
          <Area
            type="monotone"
            dataKey="avgWaitMinutes"
            name="Avg Wait (Minutes)"
            stroke="#586938"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#waitGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function QueueComparisonChart({ data }: { data: QueueCompData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-muted-foreground italic">
        No queue data available
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
          <XAxis
            dataKey="queueCode"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomChartTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
            iconType="circle"
          />
          <Bar dataKey="completed" name="Served" fill="#586938" radius={[4, 4, 0, 0]} />
          <Bar dataKey="waiting" name="Waiting" fill="#D4A373" radius={[4, 4, 0, 0]} />
          <Bar dataKey="cancelled" name="Cancelled" fill="#D97706" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ServiceEfficiencyChart({ data }: { data: ServiceEffData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-muted-foreground italic">
        No completed services recorded yet
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} iconType="circle" />
          <Bar dataKey="servedCount" name="Customers Served" fill="#CCD5AE" radius={[4, 4, 0, 0]} />
          <Bar dataKey="avgDurationMinutes" name="Avg Service Duration (min)" fill="#D4A373" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
