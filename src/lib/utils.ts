import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format milliseconds into human-readable duration like "4m 12s" or "1h 20m"
 */
export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || ms < 0 || isNaN(ms)) return "—";
  const totalSeconds = Math.floor(ms / 1000);
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format date to clean editorial timestamp e.g. "10:45 AM" or "Nov 14, 10:45 AM"
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

/**
 * Calculate elapsed wait time from creation until called (or until now if still waiting)
 */
export function calculateWaitTimeMs(
  createdAt: Date | string,
  calledAt?: Date | string | null
): number {
  const start = new Date(createdAt).getTime();
  const end = calledAt ? new Date(calledAt).getTime() : Date.now();
  return Math.max(0, end - start);
}

/**
 * Calculate service time from serviceStartedAt until completedAt
 */
export function calculateServiceTimeMs(
  serviceStartedAt?: Date | string | null,
  completedAt?: Date | string | null
): number | null {
  if (!serviceStartedAt || !completedAt) return null;
  const start = new Date(serviceStartedAt).getTime();
  const end = new Date(completedAt).getTime();
  return Math.max(0, end - start);
}
