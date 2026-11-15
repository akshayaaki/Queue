/**
 * QueueFlow Zero-Config Resilient In-Memory & File Store
 *
 * Provides a production-grade fallback data engine when PostgreSQL is not yet
 * provisioned or during serverless operations. Starts clean with zero mock data.
 */

import fs from "fs";
import path from "path";
import os from "os";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredQueue {
  id: string;
  name: string;
  description: string | null;
  queueCode: string;
  status: "ACTIVE" | "PAUSED" | "INACTIVE";
  capacity: number | null;
  nextTokenNumber: number;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredToken {
  id: string;
  queueId: string;
  tokenNumber: string;
  customerName: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  status: "WAITING" | "CALLED" | "SERVING" | "COMPLETED" | "CANCELLED" | "SKIPPED";
  position: number;
  calledAt: Date | null;
  serviceStartedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  cancellationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredQueueEvent {
  id: string;
  queueId: string;
  tokenId: string | null;
  userId: string;
  eventType: string;
  eventData: string | null;
  createdAt: Date;
}

interface StoreState {
  users: StoredUser[];
  queues: StoredQueue[];
  tokens: StoredToken[];
  events: StoredQueueEvent[];
  initialized: boolean;
}

// In-Memory Database Singleton on globalThis to persist across warm serverless invocations
declare global {
  // eslint-disable-next-line no-var
  var __queueflow_memory_db__: StoreState | undefined;
}

const STORAGE_FILE = path.join(os.tmpdir(), "queueflow_runtime_store.json");

function saveToDisk(store: StoreState) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(store), "utf-8");
  } catch {
    // Disk write may fail in restricted serverless environments, ignore safely
  }
}

function loadFromDisk(): StoreState | null {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, "utf-8");
      const parsed = JSON.parse(data);
      // Rehydrate Dates
      parsed.users = (parsed.users || []).map((u: any) => ({
        ...u,
        createdAt: new Date(u.createdAt),
        updatedAt: new Date(u.updatedAt),
      }));
      parsed.queues = (parsed.queues || []).map((q: any) => ({
        ...q,
        createdAt: new Date(q.createdAt),
        updatedAt: new Date(q.updatedAt),
      }));
      parsed.tokens = (parsed.tokens || []).map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
        calledAt: t.calledAt ? new Date(t.calledAt) : null,
        serviceStartedAt: t.serviceStartedAt ? new Date(t.serviceStartedAt) : null,
        completedAt: t.completedAt ? new Date(t.completedAt) : null,
        cancelledAt: t.cancelledAt ? new Date(t.cancelledAt) : null,
      }));
      parsed.events = (parsed.events || []).map((e: any) => ({
        ...e,
        createdAt: new Date(e.createdAt),
      }));
      parsed.initialized = true;
      return parsed;
    }
  } catch {
    // Ignore read errors
  }
  return null;
}

function getInitialStore(): StoreState {
  const diskState = loadFromDisk();
  if (diskState) {
    return diskState;
  }
  return {
    users: [],
    queues: [],
    tokens: [],
    events: [],
    initialized: true,
  };
}

export function getMemoryDB(): StoreState {
  if (!globalThis.__queueflow_memory_db__) {
    globalThis.__queueflow_memory_db__ = getInitialStore();
  }
  return globalThis.__queueflow_memory_db__;
}

// Memory Database Client implementing Prisma interface
export const memoryPrisma = {
  user: {
    findUnique: async (args: { where: { email?: string; id?: string } }) => {
      const db = getMemoryDB();
      if (args.where.email) {
        const u = db.users.find(
          (x) => x.email.toLowerCase() === args.where.email!.toLowerCase()
        );
        return u ? { ...u } : null;
      }
      if (args.where.id) {
        const u = db.users.find((x) => x.id === args.where.id);
        return u ? { ...u } : null;
      }
      return null;
    },
    findFirst: async (args: { where: any }) => {
      const db = getMemoryDB();
      const u = db.users.find((x) => matchWhere(x, args.where));
      return u ? { ...u } : null;
    },
    create: async (args: { data: any }) => {
      const db = getMemoryDB();
      const newUser: StoredUser = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: args.data.name,
        email: args.data.email,
        passwordHash: args.data.passwordHash,
        role: args.data.role || "MANAGER",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.users.push(newUser);
      saveToDisk(db);
      return { ...newUser };
    },
  },

  queue: {
    findMany: async (args?: { where?: any; orderBy?: any; include?: any; select?: any }) => {
      const db = getMemoryDB();
      let list = db.queues.filter((q) => !args?.where || matchWhere(q, args.where));

      if (args?.orderBy) {
        list = sortList(list, args.orderBy);
      }

      return list.map((q) => {
        const res: any = { ...q };
        if (args?.include?._count?.select?.tokens) {
          res._count = {
            tokens: db.tokens.filter((t) => t.queueId === q.id).length,
          };
        }
        return res;
      });
    },

    findUnique: async (args: { where: { id: string } }) => {
      const db = getMemoryDB();
      const q = db.queues.find((x) => x.id === args.where.id);
      return q ? { ...q } : null;
    },

    findFirst: async (args: { where: any }) => {
      const db = getMemoryDB();
      const q = db.queues.find((x) => matchWhere(x, args.where));
      return q ? { ...q } : null;
    },

    create: async (args: { data: any }) => {
      const db = getMemoryDB();
      const newQueue: StoredQueue = {
        id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: args.data.name,
        description: args.data.description || null,
        queueCode: (args.data.queueCode || "Q").toUpperCase(),
        status: args.data.status || "ACTIVE",
        capacity: args.data.capacity || null,
        nextTokenNumber: args.data.nextTokenNumber || 1,
        ownerId: args.data.ownerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.queues.push(newQueue);
      saveToDisk(db);
      return { ...newQueue };
    },

    update: async (args: { where: { id: string }; data: any }) => {
      const db = getMemoryDB();
      const idx = db.queues.findIndex((x) => x.id === args.where.id);
      if (idx === -1) throw new Error("QUEUE_NOT_FOUND");
      db.queues[idx] = {
        ...db.queues[idx],
        ...args.data,
        updatedAt: new Date(),
      };
      saveToDisk(db);
      return { ...db.queues[idx] };
    },

    delete: async (args: { where: { id: string } }) => {
      const db = getMemoryDB();
      const idx = db.queues.findIndex((x) => x.id === args.where.id);
      if (idx !== -1) {
        const deleted = db.queues.splice(idx, 1)[0];
        // cascade tokens
        db.tokens = db.tokens.filter((t) => t.queueId !== args.where.id);
        db.events = db.events.filter((e) => e.queueId !== args.where.id);
        saveToDisk(db);
        return { ...deleted };
      }
      return null;
    },
  },

  token: {
    findMany: async (args?: {
      where?: any;
      orderBy?: any;
      include?: any;
      select?: any;
      take?: number;
    }) => {
      const db = getMemoryDB();
      let list = db.tokens.filter((t) => !args?.where || matchWhere(t, args.where));

      if (args?.orderBy) {
        list = sortList(list, args.orderBy);
      }

      if (args?.take && args.take > 0) {
        list = list.slice(0, args.take);
      }

      return list.map((t) => {
        const res: any = { ...t };
        if (args?.include?.queue) {
          res.queue = db.queues.find((q) => q.id === t.queueId) || null;
        }
        return res;
      });
    },

    findUnique: async (args: { where: { id: string }; include?: any }) => {
      const db = getMemoryDB();
      const t = db.tokens.find((x) => x.id === args.where.id);
      if (!t) return null;
      const res: any = { ...t };
      if (args?.include?.queue) {
        res.queue = db.queues.find((q) => q.id === t.queueId) || null;
      }
      return res;
    },

    findFirst: async (args: { where: any; orderBy?: any; include?: any }) => {
      const db = getMemoryDB();
      let list = db.tokens.filter((t) => matchWhere(t, args.where));
      if (args.orderBy) {
        list = sortList(list, args.orderBy);
      }
      const t = list[0];
      if (!t) return null;
      const res: any = { ...t };
      if (args?.include?.queue) {
        res.queue = db.queues.find((q) => q.id === t.queueId) || null;
      }
      return res;
    },

    count: async (args?: { where?: any }) => {
      const db = getMemoryDB();
      if (!args?.where) return db.tokens.length;
      return db.tokens.filter((t) => matchWhere(t, args.where)).length;
    },

    create: async (args: { data: any }) => {
      const db = getMemoryDB();
      const newToken: StoredToken = {
        id: `tok_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        queueId: args.data.queueId,
        tokenNumber: args.data.tokenNumber,
        customerName: args.data.customerName,
        phone: args.data.phone || null,
        email: args.data.email || null,
        notes: args.data.notes || null,
        status: args.data.status || "WAITING",
        position: args.data.position ?? 0,
        calledAt: args.data.calledAt || null,
        serviceStartedAt: args.data.serviceStartedAt || null,
        completedAt: args.data.completedAt || null,
        cancelledAt: args.data.cancelledAt || null,
        cancellationReason: args.data.cancellationReason || null,
        createdAt: args.data.createdAt || new Date(),
        updatedAt: new Date(),
      };
      db.tokens.push(newToken);
      saveToDisk(db);
      return { ...newToken };
    },

    update: async (args: { where: { id: string }; data: any }) => {
      const db = getMemoryDB();
      const idx = db.tokens.findIndex((x) => x.id === args.where.id);
      if (idx === -1) throw new Error("TOKEN_NOT_FOUND");
      db.tokens[idx] = {
        ...db.tokens[idx],
        ...args.data,
        updatedAt: new Date(),
      };
      saveToDisk(db);
      return { ...db.tokens[idx] };
    },

    delete: async (args: { where: { id: string } }) => {
      const db = getMemoryDB();
      const idx = db.tokens.findIndex((x) => x.id === args.where.id);
      if (idx !== -1) {
        const deleted = db.tokens.splice(idx, 1)[0];
        saveToDisk(db);
        return deleted;
      }
      return null;
    },
  },

  queueEvent: {
    create: async (args: { data: any }) => {
      const db = getMemoryDB();
      const ev: StoredQueueEvent = {
        id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        queueId: args.data.queueId,
        tokenId: args.data.tokenId || null,
        userId: args.data.userId,
        eventType: args.data.eventType,
        eventData: args.data.eventData || null,
        createdAt: args.data.createdAt || new Date(),
      };
      db.events.push(ev);
      saveToDisk(db);
      return { ...ev };
    },
    findMany: async (args?: { where?: any; orderBy?: any; take?: number }) => {
      const db = getMemoryDB();
      let list = db.events.filter((e) => !args?.where || matchWhere(e, args.where));
      if (args?.orderBy) list = sortList(list, args.orderBy);
      if (args?.take) list = list.slice(0, args.take);
      return list.map((e) => ({ ...e }));
    },
    deleteMany: async (args?: { where?: any }) => {
      const db = getMemoryDB();
      if (!args?.where) {
        const count = db.events.length;
        db.events = [];
        saveToDisk(db);
        return { count };
      }
      const before = db.events.length;
      db.events = db.events.filter((e) => !matchWhere(e, args.where));
      saveToDisk(db);
      return { count: before - db.events.length };
    },
  },

  $transaction: async (cb: (tx: any) => Promise<any>) => {
    return await cb(memoryPrisma);
  },

  $queryRaw: async () => {
    return [{ result: 1 }];
  },
};

function matchWhere(item: any, where: any): boolean {
  if (!where) return true;

  for (const [key, val] of Object.entries(where)) {
    if (key === "OR" && Array.isArray(val)) {
      const matchedAny = val.some((sub) => matchWhere(item, sub));
      if (!matchedAny) return false;
      continue;
    }

    if (key === "AND" && Array.isArray(val)) {
      const matchedAll = val.every((sub) => matchWhere(item, sub));
      if (!matchedAll) return false;
      continue;
    }

    const itemVal = item[key];

    if (val === null || val === undefined) {
      if (itemVal !== null && itemVal !== undefined) return false;
      continue;
    }

    if (typeof val === "object" && !(val instanceof Date)) {
      const op = val as any;
      if (op.in && Array.isArray(op.in)) {
        if (!op.in.includes(itemVal)) return false;
      }
      if (op.notIn && Array.isArray(op.notIn)) {
        if (op.notIn.includes(itemVal)) return false;
      }
      if (op.contains && typeof itemVal === "string") {
        if (!itemVal.toLowerCase().includes(String(op.contains).toLowerCase())) return false;
      }
      if (op.gte) {
        const d1 = new Date(itemVal).getTime();
        const d2 = new Date(op.gte).getTime();
        if (d1 < d2) return false;
      }
      if (op.lte) {
        const d1 = new Date(itemVal).getTime();
        const d2 = new Date(op.lte).getTime();
        if (d1 > d2) return false;
      }
      if (op.not !== undefined) {
        if (op.not === null && itemVal === null) return false;
        if (op.not !== null && itemVal === op.not) return false;
      }
      continue;
    }

    if (itemVal instanceof Date && val instanceof Date) {
      if (itemVal.getTime() !== val.getTime()) return false;
      continue;
    }

    if (itemVal !== val) {
      return false;
    }
  }

  return true;
}

function sortList<T>(list: T[], orderBy: any): T[] {
  const items = [...list];
  const orderRules = Array.isArray(orderBy) ? orderBy : [orderBy];

  items.sort((a: any, b: any) => {
    for (const rule of orderRules) {
      const [key, dir] = Object.entries(rule)[0] || [];
      if (!key) continue;
      const valA = a[key];
      const valB = b[key];
      if (valA === valB) continue;

      const isAsc = String(dir).toLowerCase() === "asc";

      if (valA instanceof Date && valB instanceof Date) {
        return isAsc ? valA.getTime() - valB.getTime() : valB.getTime() - valA.getTime();
      }

      if (valA < valB) return isAsc ? -1 : 1;
      if (valA > valB) return isAsc ? 1 : -1;
    }
    return 0;
  });

  return items;
}
