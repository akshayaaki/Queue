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
        "rounded-xl border border-brand-platinum bg-white p-4 sm:p-5 shadow-card transition-all hover:border-brand-fern/60 dark:bg-brand-navy dark:border-brand-navyLight flex flex-col justify-between",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-navy/60 dark:text-brand-platinum/60">
          {title}
        </span>
        <div className="w-8 h-8 rounded-lg bg-brand-platinumLight text-brand-navy flex items-center justify-center border border-brand-platinum dark:bg-brand-navyDark dark:text-brand-gold dark:border-brand-navyLight">
          <Icon className="w-4 h-4 text-brand-fern" />
        </div>
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-navy dark:text-white font-mono">
          {value}
        </div>
        {(subtitle || badge) && (
          <div className="flex items-center gap-2 mt-1.5">
            {badge && (
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold font-mono",
                  trend === "up"
                    ? "bg-brand-sage/25 text-brand-forest border border-brand-sage dark:text-brand-stone"
                    : trend === "down"
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60"
                    : "bg-brand-platinum text-brand-navy border border-brand-platinum dark:bg-brand-navyDark dark:text-brand-platinum"
                )}
              >
                {badge}
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-brand-navy/60 dark:text-brand-platinum/60 truncate">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
