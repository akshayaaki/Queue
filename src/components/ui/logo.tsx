import React from "react";
import { cn } from "@/lib/utils";

export function QueueFlowLogo({
  className,
  size = "default",
}: {
  className?: string;
  size?: "sm" | "default" | "lg";
}) {
  const iconSizes = {
    sm: "w-6 h-6",
    default: "w-8 h-8",
    lg: "w-9 h-9",
  }[size];

  const textSizes = {
    sm: "text-base",
    default: "text-lg",
    lg: "text-xl",
  }[size];

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-lg bg-brand-forest text-brand-fern shadow-xs p-1.5 border border-brand-pine",
          iconSizes
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Modern Flow Lines */}
          <rect x="3" y="14" width="4" height="7" rx="1.5" fill="currentColor" fillOpacity="0.4" />
          <rect x="10" y="9" width="4" height="12" rx="1.5" fill="currentColor" fillOpacity="0.8" />
          <rect x="17" y="4" width="4" height="17" rx="1.5" fill="currentColor" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span
          className={cn(
            "font-extrabold tracking-tight text-brand-forest dark:text-white leading-none flex items-center gap-1",
            textSizes
          )}
        >
          <span>Queue</span>
          <span className="text-brand-fern">Flow</span>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-brand-sage/25 text-brand-forest border border-brand-sage dark:text-brand-stone">
            PRO
          </span>
        </span>
        <span className="text-[10px] text-brand-forest/60 font-semibold tracking-wider uppercase mt-0.5 dark:text-brand-stone/60">
          Enterprise
        </span>
      </div>
    </div>
  );
}
