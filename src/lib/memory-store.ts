/**
 * QueueFlow Zero-Config Resilient In-Memory & File Store
 *
 * Provides a production-grade fallback data engine when PostgreSQL is not yet
 * provisioned or during serverless demonstrations on platforms like Netlify.
 */

import bcrypt from "bcryptjs";

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

// In-Memory Database Singleton on globalThis to persist across warm serverless invocations
declare global {
  // eslint-disable-next-line no-var
  var __queueflow_memory_db__: {
    users: StoredUser[];
    queues: StoredQueue[];
    tokens: StoredToken[];
    events: StoredQueueEvent[];
    initialized: boolean;
  } | undefined;
}

function getInitialStore() {
  const now = new Date();
  const minutesAgo = (m: number) => new Date(now.getTime() - m * 60 * 1000);

  // Pre-hashed for "password123"
  const defaultHash = "$2a$10$wT/t7iZ2h14JzH.z0nCqI.yQ5gRkWk51N93rB30u0XqNqV3oJ1B1O";

  const users: StoredUser[] = [
    {
      id: "usr_alex_vance",
      name: "Alex Vance",
      email: "alex@queueflow.com",
      passwordHash: defaultHash,
      role: "MANAGER",
      createdAt: minutesAgo(120),
      updatedAt: minutesAgo(120),
    },
    {
      id: "usr_sarah_chen",
      name: "Dr. Sarah Chen",
      email: "sarah@queueflow.com",
      passwordHash: defaultHash,
      role: "MANAGER",
      createdAt: minutesAgo(120),
      updatedAt: minutesAgo(120),
    },
  ];

  const queues: StoredQueue[] = [
    {
      id: "queue_gen_01",
      name: "General Enquiry",
      description: "Front-desk general intake and visitor registration",
      queueCode: "GEN",
      status: "ACTIVE",
      capacity: 50,
      nextTokenNumber: 8,
      ownerId: "usr_alex_vance",
      createdAt: minutesAgo(100),
      updatedAt: minutesAgo(10),
    },
    {
      id: "queue_bil_02",
      name: "Billing Department",
      description: "Invoice verification, payments and claims",
      queueCode: "BIL",
      status: "ACTIVE",
      capacity: 30,
      nextTokenNumber: 4,
      ownerId: "usr_alex_vance",
      createdAt: minutesAgo(90),
      updatedAt: minutesAgo(8),
    },
    {
      id: "queue_vip_03",
      name: "Priority Concierge",
      description: "High-touch priority assistance for premier accounts",
      queueCode: "VIP",
      status: "ACTIVE",
      capacity: 10,
      nextTokenNumber: 3,
      ownerId: "usr_alex_vance",
      createdAt: minutesAgo(80),
      updatedAt: minutesAgo(5),
    },
    {
      id: "queue_med_04",
      name: "Clinical Consultation",
      description: "Specialist medical consultations by appointment",
      queueCode: "MED",
      status: "ACTIVE",
      capacity: 25,
      nextTokenNumber: 5,
      ownerId: "usr_sarah_chen",
      createdAt: minutesAgo(110),
      updatedAt: minutesAgo(12),
    },
  ];

  const tokens: StoredToken[] = [
    {
      id: "tok_gen_01",
      queueId: "queue_gen_01",
      tokenNumber: "GEN-001",
      customerName: "Rahul Sharma",
      phone: "+1 555-0192",
      email: "rahul.s@example.com",
      notes: "Needs international billing certificate",
      status: "COMPLETED",
      position: 0,
      createdAt: minutesAgo(85),
      calledAt: minutesAgo(70),
      serviceStartedAt: minutesAgo(68),
      completedAt: minutesAgo(50),
      cancelledAt: null,
      cancellationReason: null,
      updatedAt: minutesAgo(50),
    },
    {
      id: "tok_gen_02",
      queueId: "queue_gen_01",
      tokenNumber: "GEN-002",
      customerName: "Elena Rostova",
      phone: "+1 555-0144",
      email: "elena.r@example.com",
      notes: "Address update and account re-verification",
      status: "COMPLETED",
      position: 0,
      createdAt: minutesAgo(65),
      calledAt: minutesAgo(48),
      serviceStartedAt: minutesAgo(47),
      completedAt: minutesAgo(32),
      cancelledAt: null,
      cancellationReason: null,
      updatedAt: minutesAgo(32),
    },
    {
      id: "tok_gen_03",
      queueId: "queue_gen_01",
      tokenNumber: "GEN-003",
      customerName: "Marcus Aurelius Sterling",
      phone: "+1 555-0811",
      email: "marcus@sterling.co",
      notes: "Customer had urgent meeting and departed counter",
      status: "CANCELLED",
      cancellationReason: "Customer departed queue voluntarily",
      position: 0,
      createdAt: minutesAgo(55),
      calledAt: null,
      serviceStartedAt: null,
      completedAt: null,
      cancelledAt: minutesAgo(40),
      updatedAt: minutesAgo(40),
    },
    {
      id: "tok_gen_04",
      queueId: "queue_gen_01",
      tokenNumber: "GEN-004",
      customerName: "Amina Al-Mansoor",
      phone: "+1 555-0329",
      email: "amina.m@example.com",
      notes: "Reviewing enterprise onboarding agreement",
      status: "SERVING",
      position: 0,
      createdAt: minutesAgo(40),
      calledAt: minutesAgo(12),
      serviceStartedAt: minutesAgo(10),
      completedAt: null,
      cancelledAt: null,
      cancellationReason: null,
      updatedAt: minutesAgo(10),
    },
    {
      id: "tok_gen_05",
      queueId: "queue_gen_01",
      tokenNumber: "GEN-005",
      customerName: "David K. O'Connor",
      phone: "+1 555-0771",
      email: "david.oc@example.com",
      notes: "Passport verification document checks",
      status: "WAITING",
      position: 1,
      createdAt: minutesAgo(28),
      calledAt: null,
      serviceStartedAt: null,
      completedAt: null,
      cancelledAt: null,
      cancellationReason: null,
      updatedAt: minutesAgo(28),
    },
    {
      id: "tok_gen_06",
      queueId: "queue_gen_01",
      tokenNumber: "GEN-006",
      customerName: "Priya Patel",
      phone: "+1 555-0453",
      email: "priya.patel@example.com",
      notes: "New account card collection",
      status: "WAITING",
      position: 2,
      createdAt: minutesAgo(18),
      calledAt: null,
      serviceStartedAt: null,
      completedAt: null,
      cancelledAt: null,
      cancellationReason: null,
      updatedAt: minutesAgo(18),
    },
    {
      id: "tok_gen_07",
      queueId: "queue_gen_01",
      tokenNumber: "GEN-007",
      customerName: "Liam Chen-Miller",
      phone: "+1 555-0912",
      email: "liam.cm@example.com",
      notes: "Express dispute filing inquiry",
      status: "WAITING",
      position: 3,
      createdAt: minutesAgo(7),
      calledAt: null,
      serviceStartedAt: null,
      completedAt: null,
      cancelledAt: null,
      cancellationReason: null,
      updatedAt: minutesAgo(7),
    },
    // Billing Tokens
    {
      id: "tok_bil_01",
      queueId: "queue_bil_02",
      tokenNumber: "BIL-001",
      customerName: "Sophia Loren Martinez",
      phone: "+1 555-9011",
      email: null,
      notes: null,
      status: "SERVING",
      position: 0,
      createdAt: minutesAgo(30),
      calledAt: minutesAgo(8),
      serviceStartedAt: minutesAgo(7),
      completedAt: null,
      cancelledAt: null,
      cancellationReason: null,
      updatedAt: minutesAgo(7),
    },
    {
      id: "tok_bil_02",
      queueId: "queue_bil_02",
      tokenNumber: "BIL-002",
      customerName: "Kenji Takahashi",
      phone: "+1 555-4421",
      email: null,
      notes: null,
      status: "WAITING",
      position: 1,
      createdAt: minutesAgo(15),
      calledAt: null,
      serviceStartedAt: null,
      completedAt: null,
      cancelledAt: null,
      cancellationReason: null,
      updatedAt: minutesAgo(15),
    },
    {
      id: "tok_bil_03",
      queueId: "queue_bil_02",
      tokenNumber: "BIL-003",
      customerName: "Chloe Dupont",
      phone: "+1 555-6612",
      email: null,
      notes: null,
      status: "WAITING",
      position: 2,
      createdAt: minutesAgo(4),
      calledAt: null,
      serviceStartedAt: null,
      completedAt: null,
      cancelledAt: null,
      cancellationReason: null,
      updatedAt: minutesAgo(4),
    },
    // Medical Tokens
    {
      id: "tok_med_01",
      queueId: "queue_med_04",
      tokenNumber: "MED-001",
      customerName: "Grace Hopper",
      phone: "+1 555-7788",
      email: "grace@navy.mil",
      notes: "Cardiology follow-up",
      status: "SERVING",
      position: 0,
      createdAt: minutesAgo(45),
      calledAt: minutesAgo(15),
      serviceStartedAt: minutesAgo(14),
      completedAt: null,
      cancelledAt: null,
      cancellationReason: null,
      updatedAt: minutesAgo(14),
    },
    {
      id: "tok_med_02",
      queueId: "queue_med_04",
      tokenNumber: "MED-002",
      customerName: "Alan Turing",
      phone: "+1 555-9922",
      email: "alan@bletchley.uk",
      notes: "Neurology consultation",
      status: "WAITING",
      position: 1,
      createdAt: minutesAgo(20),
      calledAt: null,
      serviceStartedAt: null,
      completedAt: null,
      cancelledAt: null,
      cancellationReason: null,
      updatedAt: minutesAgo(20),
    },
  ];

  const events: StoredQueueEvent[] = [
    {
      id: "ev_1",
      queueId: "queue_gen_01",
      tokenId: "tok_gen_01",
      userId: "usr_alex_vance",
      eventType: "TOKEN_COMPLETED",
      eventData: JSON.stringify({ tokenNumber: "GEN-001" }),
      createdAt: minutesAgo(50),
    },
    {
      id: "ev_2",
      queueId: "queue_gen_01",
      tokenId: "tok_gen_02",
      userId: "usr_alex_vance",
      eventType: "TOKEN_COMPLETED",
      eventData: JSON.stringify({ tokenNumber: "GEN-002" }),
      createdAt: minutesAgo(32),
    },
    {
      id: "ev_3",
      queueId: "queue_gen_01",
      tokenId: "tok_gen_03",
      userId: "usr_alex_vance",
      eventType: "TOKEN_CANCELLED",
      eventData: JSON.stringify({ reason: "Customer departed queue voluntarily" }),
      createdAt: minutesAgo(40),
    },
    {
      id: "ev_4",
      queueId: "queue_gen_01",
      tokenId: "tok_gen_04",
      userId: "usr_alex_vance",
      eventType: "SERVICE_STARTED",
      eventData: JSON.stringify({ tokenNumber: "GEN-004" }),
      createdAt: minutesAgo(10),
    },
  ];

  return { users, queues, tokens, events, initialized: true };
}

export function getMemoryDB() {
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
        queueCode: args.data.queueCode.toUpperCase(),
        status: args.data.status || "ACTIVE",
        capacity: args.data.capacity || null,
        nextTokenNumber: args.data.nextTokenNumber || 1,
        ownerId: args.data.ownerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.queues.push(newQueue);
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
      return { ...db.tokens[idx] };
    },

    delete: async (args: { where: { id: string } }) => {
      const db = getMemoryDB();
      const idx = db.tokens.findIndex((x) => x.id === args.where.id);
      if (idx !== -1) {
        return db.tokens.splice(idx, 1)[0];
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
        return { count };
      }
      const before = db.events.length;
      db.events = db.events.filter((e) => !matchWhere(e, args.where));
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
