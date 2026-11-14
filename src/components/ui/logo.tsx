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
    lg: "w-10 h-10",
  }[size];

  const textSizes = {
    sm: "text-base",
    default: "text-xl",
    lg: "text-2xl",
  }[size];

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#FEFAE0] via-[#FAEDCD] to-[#D4A373] p-1.5 shadow-[0_2px_8px_rgba(212,163,115,0.3)] border border-[#D4A373]/30",
          iconSizes
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Stepped Queue Glyphs */}
          <rect x="3" y="15" width="4" height="6" rx="1.5" fill="#586938" />
          <rect x="10" y="9" width="4" height="12" rx="1.5" fill="#8C5E28" />
          <rect x="17" y="3" width="4" height="18" rx="1.5" fill="#D4A373" />
          {/* Forward Flow Dot */}
          <circle cx="19" cy="5" r="1.5" fill="#FEFAE0" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span
          className={cn(
            "font-bold tracking-tight text-foreground font-serif leading-none",
            textSizes
          )}
        >
          Queue<span className="text-palette-ochre font-sans">Flow</span>
        </span>
        <span className="text-[10px] tracking-widest uppercase font-semibold text-muted-foreground/80 -mt-0.5">
          Enterprise
        </span>
      </div>
    </div>
  );
}
