import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  trend,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-bespoke flex flex-col justify-between transition-all hover:border-palette-ochre/30",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <div className="w-8 h-8 rounded-xl bg-palette-bisque/70 text-palette-ochreDark flex items-center justify-center border border-palette-ochre/20 shadow-2xs dark:bg-palette-ochre/15 dark:text-palette-ochre">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
          {value}
        </div>
        {(subtitle || badge) && (
          <div className="flex items-center gap-2 mt-1.5">
            {badge && (
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold font-mono",
                  trend === "up"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : trend === "down"
                    ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {badge}
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-muted-foreground truncate">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
