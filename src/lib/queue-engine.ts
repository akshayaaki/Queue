import prisma from "./db";
import { eventBus } from "./events";
import { TokenStatus } from "@/types";

export const ALLOWED_TRANSITIONS: Record<TokenStatus, TokenStatus[]> = {
  WAITING: ["CALLED", "CANCELLED", "SKIPPED"],
  CALLED: ["SERVING", "COMPLETED", "SKIPPED", "CANCELLED", "WAITING"],
  SERVING: ["COMPLETED", "SKIPPED", "CANCELLED"],
  SKIPPED: ["WAITING", "CALLED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransition(current: TokenStatus, next: TokenStatus): boolean {
  if (current === next) return true;
  const allowed = ALLOWED_TRANSITIONS[current] || [];
  return allowed.includes(next);
}

export function formatTokenNumber(prefix: string, sequence: number): string {
  const padded = String(sequence).padStart(3, "0");
  return `${prefix.toUpperCase()}-${padded}`;
}

export class QueueEngine {
  /**
   * Add a new customer to queue with atomic token sequence generation.
   */
  static async addCustomer(params: {
    queueId: string;
    userId: string;
    customerName: string;
    phone?: string | null;
    email?: string | null;
    notes?: string | null;
  }) {
    const { queueId, userId, customerName, phone, email, notes } = params;

    return await prisma.$transaction(async (tx: any) => {
      // 1. Lock/fetch queue
      const queue = await tx.queue.findUnique({
        where: { id: queueId },
      });

      if (!queue) {
        throw new Error("QUEUE_NOT_FOUND");
      }

      if (queue.status !== "ACTIVE") {
        throw new Error(`QUEUE_NOT_ACTIVE: Current status is ${queue.status}`);
      }

      // Check capacity if set
      if (queue.capacity) {
        const waitingCount = await tx.token.count({
          where: { queueId, status: "WAITING" },
        });
        if (waitingCount >= queue.capacity) {
          throw new Error("QUEUE_CAPACITY_REACHED");
        }
      }

      // 2. Generate token number from sequence
      const tokenNumber = formatTokenNumber(queue.queueCode, queue.nextTokenNumber);

      // 3. Find current max position among waiting tokens
      const lastWaiting = await tx.token.findFirst({
        where: { queueId, status: "WAITING" },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      const newPosition = (lastWaiting?.position ?? 0) + 1;

      // 4. Create Token
      const token = await tx.token.create({
        data: {
          queueId,
          tokenNumber,
          customerName,
          phone: phone || null,
          email: email || null,
          notes: notes || null,
          status: "WAITING",
          position: newPosition,
        },
      });

      // 5. Increment queue token sequence
      await tx.queue.update({
        where: { id: queueId },
        data: { nextTokenNumber: queue.nextTokenNumber + 1 },
      });

      // 6. Log Audit Event
      await tx.queueEvent.create({
        data: {
          queueId,
          tokenId: token.id,
          userId,
          eventType: "TOKEN_CREATED",
          eventData: JSON.stringify({ tokenNumber, customerName }),
        },
      });

      // 7. Realtime Broadcast
      eventBus.broadcast(queueId, {
        type: "TOKEN_CREATED",
        data: token,
      });

      return token;
    });
  }

  /**
   * Concurrency-safe Call Next:
   * Atomically assigns the first WAITING token in position order.
   */
  static async callNext(queueId: string, userId: string) {
    return await prisma.$transaction(async (tx: any) => {
      // Find the first waiting customer
      const candidate = await tx.token.findFirst({
        where: {
          queueId,
          status: "WAITING",
        },
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      });

      if (!candidate) {
        return {
          success: false,
          token: null,
          message: "No waiting customers in this queue",
        };
      }

      const calledAt = new Date();

      // Update candidate to CALLED
      const updatedToken = await tx.token.update({
        where: { id: candidate.id },
        data: {
          status: "CALLED",
          calledAt,
          position: 0,
        },
      });

      // Compact waiting positions (1, 2, 3...)
      const remainingWaiting = await tx.token.findMany({
        where: { queueId, status: "WAITING" },
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      });

      for (let i = 0; i < remainingWaiting.length; i++) {
        if (remainingWaiting[i].position !== i + 1) {
          await tx.token.update({
            where: { id: remainingWaiting[i].id },
            data: { position: i + 1 },
          });
        }
      }

      // Record audit event
      await tx.queueEvent.create({
        data: {
          queueId,
          tokenId: updatedToken.id,
          userId,
          eventType: "TOKEN_CALLED",
          eventData: JSON.stringify({ tokenNumber: updatedToken.tokenNumber }),
        },
      });

      // Broadcast
      eventBus.broadcast(queueId, {
        type: "TOKEN_CALLED",
        data: updatedToken,
      });

      return {
        success: true,
        token: updatedToken,
        message: `Token ${updatedToken.tokenNumber} called for service`,
      };
    });
  }

  /**
   * Token Reordering: Move Up or Down within WAITING list.
   * Transactional and atomic.
   */
  static async reorderToken(params: {
    queueId: string;
    tokenId: string;
    userId: string;
    direction: "UP" | "DOWN";
  }) {
    const { queueId, tokenId, userId, direction } = params;

    return await prisma.$transaction(async (tx: any) => {
      const target = await tx.token.findUnique({
        where: { id: tokenId },
      });

      if (!target || target.queueId !== queueId) {
        throw new Error("TOKEN_NOT_FOUND");
      }

      if (target.status !== "WAITING") {
        throw new Error("CANNOT_REORDER_NON_WAITING_TOKEN");
      }

      // Find adjacent token
      let adjacent;
      if (direction === "UP") {
        adjacent = await tx.token.findFirst({
          where: {
            queueId,
            status: "WAITING",
            position: { lt: target.position },
          },
          orderBy: { position: "desc" },
        });
      } else {
        adjacent = await tx.token.findFirst({
          where: {
            queueId,
            status: "WAITING",
            position: { gt: target.position },
          },
          orderBy: { position: "asc" },
        });
      }

      if (!adjacent) {
        // Already at boundary
        return { success: true, swapped: false, target };
      }

      const targetPos = target.position;
      const adjacentPos = adjacent.position;

      // Swap positions safely
      // Step A: Move adjacent to temporary negative position
      await tx.token.update({
        where: { id: adjacent.id },
        data: { position: -9999 },
      });

      // Step B: Move target to adjacent's old position
      const updatedTarget = await tx.token.update({
        where: { id: target.id },
        data: { position: adjacentPos },
      });

      // Step C: Move adjacent to target's old position
      await tx.token.update({
        where: { id: adjacent.id },
        data: { position: targetPos },
      });

      // Audit log
      await tx.queueEvent.create({
        data: {
          queueId,
          tokenId: target.id,
          userId,
          eventType: "TOKEN_REORDERED",
          eventData: JSON.stringify({
            direction,
            from: targetPos,
            to: adjacentPos,
          }),
        },
      });

      // Broadcast
      eventBus.broadcast(queueId, {
        type: "TOKEN_REORDERED",
        data: { tokenId: target.id, newPosition: adjacentPos },
      });

      return { success: true, swapped: true, target: updatedTarget };
    });
  }

  /**
   * Start Service
   */
  static async startService(tokenId: string, userId: string) {
    return await prisma.$transaction(async (tx: any) => {
      const token = await tx.token.findUnique({ where: { id: tokenId } });
      if (!token) throw new Error("TOKEN_NOT_FOUND");

      if (!canTransition(token.status as TokenStatus, "SERVING")) {
        throw new Error(`INVALID_TRANSITION: Cannot transition from ${token.status} to SERVING`);
      }

      const updated = await tx.token.update({
        where: { id: tokenId },
        data: {
          status: "SERVING",
          serviceStartedAt: token.serviceStartedAt ?? new Date(),
        },
      });

      await tx.queueEvent.create({
        data: {
          queueId: token.queueId,
          tokenId,
          userId,
          eventType: "SERVICE_STARTED",
          eventData: JSON.stringify({ tokenNumber: token.tokenNumber }),
        },
      });

      eventBus.broadcast(token.queueId, {
        type: "SERVICE_STARTED",
        data: updated,
      });

      return updated;
    });
  }

  /**
   * Complete Service
   */
  static async completeService(tokenId: string, userId: string) {
    return await prisma.$transaction(async (tx: any) => {
      const token = await tx.token.findUnique({ where: { id: tokenId } });
      if (!token) throw new Error("TOKEN_NOT_FOUND");

      if (!canTransition(token.status as TokenStatus, "COMPLETED")) {
        throw new Error(`INVALID_TRANSITION: Cannot transition from ${token.status} to COMPLETED`);
      }

      const updated = await tx.token.update({
        where: { id: tokenId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      await tx.queueEvent.create({
        data: {
          queueId: token.queueId,
          tokenId,
          userId,
          eventType: "SERVICE_COMPLETED",
          eventData: JSON.stringify({ tokenNumber: token.tokenNumber }),
        },
      });

      eventBus.broadcast(token.queueId, {
        type: "SERVICE_COMPLETED",
        data: updated,
      });

      return updated;
    });
  }

  /**
   * Skip Token
   */
  static async skipToken(tokenId: string, userId: string) {
    return await prisma.$transaction(async (tx: any) => {
      const token = await tx.token.findUnique({ where: { id: tokenId } });
      if (!token) throw new Error("TOKEN_NOT_FOUND");

      if (!canTransition(token.status as TokenStatus, "SKIPPED")) {
        throw new Error(`INVALID_TRANSITION: Cannot transition from ${token.status} to SKIPPED`);
      }

      const updated = await tx.token.update({
        where: { id: tokenId },
        data: {
          status: "SKIPPED",
          skippedAt: new Date(),
        },
      });

      await tx.queueEvent.create({
        data: {
          queueId: token.queueId,
          tokenId,
          userId,
          eventType: "TOKEN_SKIPPED",
          eventData: JSON.stringify({ tokenNumber: token.tokenNumber }),
        },
      });

      eventBus.broadcast(token.queueId, {
        type: "TOKEN_SKIPPED",
        data: updated,
      });

      return updated;
    });
  }

  /**
   * Cancel Token (Non-destructive)
   */
  static async cancelToken(tokenId: string, userId: string, reason?: string | null) {
    return await prisma.$transaction(async (tx: any) => {
      const token = await tx.token.findUnique({ where: { id: tokenId } });
      if (!token) throw new Error("TOKEN_NOT_FOUND");

      if (!canTransition(token.status as TokenStatus, "CANCELLED")) {
        throw new Error(`INVALID_TRANSITION: Cannot transition from ${token.status} to CANCELLED`);
      }

      const updated = await tx.token.update({
        where: { id: tokenId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancellationReason: reason || "Cancelled by manager",
          position: 0,
        },
      });

      // Re-compact remaining waiting tokens if this was waiting
      if (token.status === "WAITING") {
        const remaining = await tx.token.findMany({
          where: { queueId: token.queueId, status: "WAITING" },
          orderBy: { position: "asc" },
        });
        for (let i = 0; i < remaining.length; i++) {
          if (remaining[i].position !== i + 1) {
            await tx.token.update({
              where: { id: remaining[i].id },
              data: { position: i + 1 },
            });
          }
        }
      }

      await tx.queueEvent.create({
        data: {
          queueId: token.queueId,
          tokenId,
          userId,
          eventType: "TOKEN_CANCELLED",
          eventData: JSON.stringify({ reason: reason || null }),
        },
      });

      eventBus.broadcast(token.queueId, {
        type: "TOKEN_CANCELLED",
        data: updated,
      });

      return updated;
    });
  }

  /**
   * Recall a skipped or called token back into active call
   */
  static async recallToken(tokenId: string, userId: string) {
    return await prisma.$transaction(async (tx: any) => {
      const token = await tx.token.findUnique({ where: { id: tokenId } });
      if (!token) throw new Error("TOKEN_NOT_FOUND");

      const updated = await tx.token.update({
        where: { id: tokenId },
        data: {
          status: "CALLED",
          calledAt: new Date(),
        },
      });

      await tx.queueEvent.create({
        data: {
          queueId: token.queueId,
          tokenId,
          userId,
          eventType: "TOKEN_RECALLED",
          eventData: JSON.stringify({ tokenNumber: token.tokenNumber }),
        },
      });

      eventBus.broadcast(token.queueId, {
        type: "TOKEN_RECALLED",
        data: updated,
      });

      return updated;
    });
  }
}
