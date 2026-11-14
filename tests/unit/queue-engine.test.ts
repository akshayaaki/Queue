import { describe, it, expect } from "vitest";
import {
  canTransition,
  formatTokenNumber,
  ALLOWED_TRANSITIONS,
} from "@/lib/queue-engine";
import {
  calculateWaitTimeMs,
  calculateServiceTimeMs,
  formatDuration,
} from "@/lib/utils";
import { TokenStatus } from "@/types";

describe("Queue Engine Unit Tests", () => {
  describe("Token Number Generation", () => {
    it("should format token numbers with 3-digit padding by default", () => {
      expect(formatTokenNumber("GEN", 1)).toBe("GEN-001");
      expect(formatTokenNumber("gen", 5)).toBe("GEN-005");
      expect(formatTokenNumber("BIL", 42)).toBe("BIL-042");
      expect(formatTokenNumber("VIP", 999)).toBe("VIP-999");
    });

    it("should handle 4+ digit sequence numbers gracefully", () => {
      expect(formatTokenNumber("MED", 1245)).toBe("MED-1245");
    });
  });

  describe("Token Status Transitions State Machine", () => {
    it("should permit valid lifecycle transitions", () => {
      // WAITING -> CALLED
      expect(canTransition("WAITING", "CALLED")).toBe(true);
      // WAITING -> CANCELLED
      expect(canTransition("WAITING", "CANCELLED")).toBe(true);
      // CALLED -> SERVING
      expect(canTransition("CALLED", "SERVING")).toBe(true);
      // SERVING -> COMPLETED
      expect(canTransition("SERVING", "COMPLETED")).toBe(true);
      // CALLED -> SKIPPED
      expect(canTransition("CALLED", "SKIPPED")).toBe(true);
      // Same status is always permitted
      expect(canTransition("WAITING", "WAITING")).toBe(true);
    });

    it("should reject illegal transitions", () => {
      // Cannot jump from WAITING directly to COMPLETED
      expect(canTransition("WAITING", "COMPLETED")).toBe(false);
      // Terminal states cannot transition to active states
      expect(canTransition("COMPLETED", "WAITING")).toBe(false);
      expect(canTransition("COMPLETED", "CALLED")).toBe(false);
      expect(canTransition("CANCELLED", "SERVING")).toBe(false);
      expect(canTransition("CANCELLED", "COMPLETED")).toBe(false);
    });
  });

  describe("Time and Duration Metrics Calculations", () => {
    it("should accurately calculate wait time from created to called", () => {
      const created = new Date("2026-11-14T10:00:00Z");
      const called = new Date("2026-11-14T10:14:30Z"); // 14m 30s
      const waitMs = calculateWaitTimeMs(created, called);
      expect(waitMs).toBe(14 * 60 * 1000 + 30 * 1000);
      expect(formatDuration(waitMs)).toBe("14m 30s");
    });

    it("should accurately calculate service duration", () => {
      const started = new Date("2026-11-14T10:15:00Z");
      const completed = new Date("2026-11-14T10:23:45Z"); // 8m 45s
      const serviceMs = calculateServiceTimeMs(started, completed);
      expect(serviceMs).toBe(8 * 60 * 1000 + 45 * 1000);
      expect(formatDuration(serviceMs)).toBe("8m 45s");
    });

    it("should handle null or incomplete service timestamps correctly", () => {
      expect(calculateServiceTimeMs(null, null)).toBeNull();
      expect(calculateServiceTimeMs(new Date(), null)).toBeNull();
      expect(formatDuration(null)).toBe("—");
    });

    it("should format short durations in seconds and long in hours/minutes", () => {
      expect(formatDuration(45 * 1000)).toBe("45s");
      expect(formatDuration(2 * 60 * 1000)).toBe("2m");
      expect(formatDuration(75 * 60 * 1000)).toBe("1h 15m");
    });
  });
});
