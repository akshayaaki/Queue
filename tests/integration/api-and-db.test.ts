import { describe, it, expect, beforeAll, afterAll } from "vitest";
import prisma from "@/lib/db";
import { QueueEngine } from "@/lib/queue-engine";
import {
  hashPassword,
  comparePassword,
  createSessionToken,
  verifySessionToken,
  assertQueueOwnership,
} from "@/lib/auth";

describe("QueueFlow Integration Tests (Database & Domain Logic)", () => {
  let managerA: any;
  let managerB: any;
  let queueA: any;
  let queueB: any;

  beforeAll(async () => {
    // Clean test data
    await prisma.queueEvent.deleteMany({});
    await prisma.token.deleteMany({});
    await prisma.queue.deleteMany({});
    await prisma.user.deleteMany({});

    const passwordHash = await hashPassword("securePassword123");

    // Create Manager A
    managerA = await prisma.user.create({
      data: {
        name: "Test Manager A",
        email: "managerA@test.com",
        passwordHash,
        role: "MANAGER",
      },
    });

    // Create Manager B (Tenant Isolation testing)
    managerB = await prisma.user.create({
      data: {
        name: "Test Manager B",
        email: "managerB@test.com",
        passwordHash,
        role: "MANAGER",
      },
    });

    // Create Queue for Manager A
    queueA = await prisma.queue.create({
      data: {
        name: "Counter Alpha",
        queueCode: "ALP",
        status: "ACTIVE",
        ownerId: managerA.id,
        nextTokenNumber: 1,
      },
    });

    // Create Queue for Manager B
    queueB = await prisma.queue.create({
      data: {
        name: "Counter Beta",
        queueCode: "BET",
        status: "ACTIVE",
        ownerId: managerB.id,
        nextTokenNumber: 1,
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("Authentication & Session Verification", () => {
    it("should securely hash and verify passwords", async () => {
      const match = await comparePassword("securePassword123", managerA.passwordHash);
      const invalid = await comparePassword("wrongPassword", managerA.passwordHash);
      expect(match).toBe(true);
      expect(invalid).toBe(false);
    });

    it("should issue and verify valid signed JWT sessions", async () => {
      const sessionData = {
        id: managerA.id,
        name: managerA.name,
        email: managerA.email,
        role: managerA.role,
      };
      const token = await createSessionToken(sessionData);
      expect(token).toBeDefined();

      const decoded = await verifySessionToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.email).toBe(managerA.email);
      expect(decoded?.id).toBe(managerA.id);
    });
  });

  describe("Tenant Isolation & Authorization Boundaries", () => {
    it("should allow Manager A to access their own queue", async () => {
      const q = await assertQueueOwnership(queueA.id, managerA.id);
      expect(q.id).toBe(queueA.id);
    });

    it("should block Manager B from accessing Manager A's queue", async () => {
      await expect(
        assertQueueOwnership(queueA.id, managerB.id)
      ).rejects.toThrow("QUEUE_NOT_FOUND_OR_FORBIDDEN");
    });
  });

  describe("Token Management & Atomic Sequences", () => {
    let token1: any;
    let token2: any;
    let token3: any;

    it("should add three customers with sequential token numbers", async () => {
      token1 = await QueueEngine.addCustomer({
        queueId: queueA.id,
        userId: managerA.id,
        customerName: "Alice Customer",
        phone: "+1 555-0101",
      });

      token2 = await QueueEngine.addCustomer({
        queueId: queueA.id,
        userId: managerA.id,
        customerName: "Bob Customer",
        phone: "+1 555-0102",
      });

      token3 = await QueueEngine.addCustomer({
        queueId: queueA.id,
        userId: managerA.id,
        customerName: "Charlie Customer",
        phone: "+1 555-0103",
      });

      expect(token1.tokenNumber).toBe("ALP-001");
      expect(token2.tokenNumber).toBe("ALP-002");
      expect(token3.tokenNumber).toBe("ALP-003");

      expect(token1.position).toBe(1);
      expect(token2.position).toBe(2);
      expect(token3.position).toBe(3);
    });

    it("should reorder waiting tokens atomically (Move Token 3 Up above Token 2)", async () => {
      const result = await QueueEngine.reorderToken({
        queueId: queueA.id,
        tokenId: token3.id,
        userId: managerA.id,
        direction: "UP",
      });

      expect(result.swapped).toBe(true);

      const refreshedToken3 = await prisma.token.findUnique({ where: { id: token3.id } });
      const refreshedToken2 = await prisma.token.findUnique({ where: { id: token2.id } });

      // Token 3 should now be at position 2, and Token 2 at position 3
      expect(refreshedToken3?.position).toBe(2);
      expect(refreshedToken2?.position).toBe(3);
    });

    it("should call next customer atomically", async () => {
      const callResult = await QueueEngine.callNext(queueA.id, managerA.id);

      expect(callResult.success).toBe(true);
      expect(callResult.token?.id).toBe(token1.id);
      expect(callResult.token?.status).toBe("CALLED");
      expect(callResult.token?.position).toBe(0);

      // Remaining waiting tokens should be re-compacted to positions 1 and 2
      const waiting = await prisma.token.findMany({
        where: { queueId: queueA.id, status: "WAITING" },
        orderBy: { position: "asc" },
      });

      expect(waiting.length).toBe(2);
      expect(waiting[0].id).toBe(token3.id);
      expect(waiting[0].position).toBe(1);
      expect(waiting[1].id).toBe(token2.id);
      expect(waiting[1].position).toBe(2);
    });

    it("should progress called token to SERVING and COMPLETED", async () => {
      const serving = await QueueEngine.startService(token1.id, managerA.id);
      expect(serving.status).toBe("SERVING");
      expect(serving.serviceStartedAt).not.toBeNull();

      const completed = await QueueEngine.completeService(token1.id, managerA.id);
      expect(completed.status).toBe("COMPLETED");
      expect(completed.completedAt).not.toBeNull();
    });

    it("should cancel a waiting token non-destructively and record reason", async () => {
      const cancelled = await QueueEngine.cancelToken(
        token2.id,
        managerA.id,
        "Customer withdrew request"
      );

      expect(cancelled.status).toBe("CANCELLED");
      expect(cancelled.cancellationReason).toBe("Customer withdrew request");
      expect(cancelled.cancelledAt).not.toBeNull();

      // Record still exists in database for reporting
      const persisted = await prisma.token.findUnique({ where: { id: token2.id } });
      expect(persisted).not.toBeNull();
      expect(persisted?.status).toBe("CANCELLED");
    });
  });
});
