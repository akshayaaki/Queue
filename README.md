# QueueFlow Enterprise 2.0

> **A Bespoke, High-Throughput Queue Management Platform**  
> Engineered with Next.js 14 App Router, TypeScript, Prisma ORM, Server-Sent Events (SSE) Real-Time Synchronization, and Native Multi-Tenant Manager Isolation.

Designed with an editorial, high-ticket visual aesthetic using the bespoke warm palette [`#CCD5AE`, `#E9EDC9`, `#FEFAE0`, `#FAEDCD`, `#D4A373`](https://coolors.co/palette/ccd5ae-e9edc9-fefae0-faedcd-d4a373).

---

## 1. Executive Summary & Capabilities

**QueueFlow** provides high-reliability queue telemetry and operational dispatch for enterprise counters, clinic lobbies, customer service desks, and intake centers.

### Key Highlights
- **Atomic Token Generation & Sequencing**: Sequential numbering prefixes (e.g., `GEN-001`, `BIL-042`, `VIP-003`) allocated atomically inside database transactions.
- **Concurrency-Safe Dispatch ("Call Next")**: Guaranteed single-assignment under simultaneous manager requests with row compaction.
- **Bi-Directional Waiting Queue Reordering**: Instant Move Up / Move Down repositioning strictly restricted to waiting customers.
- **Full Service Lifecycle State Machine**: Enforces strict transitions:
  $$\text{WAITING} \longrightarrow \text{CALLED} \longrightarrow \text{SERVING} \longrightarrow \text{COMPLETED}$$
  with non-destructive cancellation and audit trail preservation.
- **Zero-Latency Real-Time Synchronization**: Native Server-Sent Events (SSE) broadcaster keeps multiple tabs, desks, and waiting screens synchronized in under 5ms.
- **Live Acoustic Chime**: Synthesized dual-tone harmonic lounge chime (F#5 $\to$ C#6) via the Web Audio API without external audio files.
- **Database-Backed Analytics**: Real SQL aggregations for wait time ($\text{calledAt} - \text{createdAt}$), service duration ($\text{completedAt} - \text{serviceStartedAt}$), hourly throughput, and queue comparison.
- **Multi-Tenant Manager Isolation**: Robust server-side verification ensuring managers can access only their authorized queues.

---

## 2. Technology Stack & Architecture

```
                          ┌──────────────────────────────────────┐
                          │         Next.js App Router           │
                          │   (React 18, TypeScript, Tailwind)   │
                          └──────────────────┬───────────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
          ┌─────────────────────────┐                 ┌─────────────────────────┐
          │     Server Actions      │                 │    Server-Sent Events   │
          │    & REST API Routes    │                 │      Event Stream       │
          └────────────┬────────────┘                 └────────────┬────────────┘
                       │                                           │
                       ▼                                           ▼
          ┌─────────────────────────┐                 ┌─────────────────────────┐
          │  Domain Engine & Logic  │                 │  Realtime Event Bus     │
          │  (Atomic Transactions)  │───────────────▶ │  (In-Memory Broadcast)  │
          └────────────┬────────────┘                 └─────────────────────────┘
                       │
                       ▼
          ┌─────────────────────────┐
          │     Prisma ORM Layer    │
          └────────────┬────────────┘
                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
┌───────────────┐             ┌───────────────┐
│  PostgreSQL   │ (Production)│    SQLite     │ (Local Dev / CI)
│  (Supabase /  │             │   (dev.db)    │
│  Neon / RDS)  │             │               │
└───────────────┘             └───────────────┘
```

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript Strict, Tailwind CSS, Lucide Icons, Recharts, Sonner Toaster |
| **Backend** | Next.js Route Handlers, Jose JWT Sessions, Bcrypt.js, Zod Schema Validation |
| **Database** | PostgreSQL (Production) / SQLite (Zero-config local), Prisma ORM |
| **Realtime** | Server-Sent Events (SSE) HTTP stream with auto-reconnect & heartbeats |
| **Audio** | Web Audio API Synthesizer (Harmonic bell chime) |
| **Testing** | Vitest 2, React Testing Library, Playwright E2E |

---

## 3. Database Schema Overview

```prisma
model User {
  id           String       @id @default(cuid())
  name         String
  email        String       @unique
  passwordHash String
  role         String       @default("MANAGER")
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  queues       Queue[]
  events       QueueEvent[]
}

model Queue {
  id              String       @id @default(cuid())
  name            String
  description     String?
  queueCode       String
  status          String       @default("ACTIVE")
  ownerId         String
  owner           User         @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  nextTokenNumber Int          @default(1)
  capacity        Int?
  tokens          Token[]
  events          QueueEvent[]
  @@unique([ownerId, queueCode])
}

model Token {
  id                 String       @id @default(cuid())
  queueId            String
  queue              Queue        @relation(fields: [queueId], references: [id], onDelete: Cascade)
  tokenNumber        String       // e.g. "GEN-001"
  customerName       String
  phone              String?
  email              String?
  notes              String?
  status             String       @default("WAITING") // WAITING, CALLED, SERVING, COMPLETED, CANCELLED, SKIPPED
  position           Int          @default(0)
  cancellationReason String?
  createdAt          DateTime     @default(now())
  calledAt           DateTime?
  serviceStartedAt   DateTime?
  completedAt        DateTime?
  cancelledAt        DateTime?
  skippedAt          DateTime?
  events             QueueEvent[]
}

model QueueEvent {
  id        String   @id @default(cuid())
  queueId   String
  tokenId   String?
  userId    String
  eventType String
  eventData String?
  createdAt DateTime @default(now())
}
```

---

## 4. Quick Start & Local Development

### Prerequisites
- Node.js 18.17+ or 20.x
- pnpm or npm

### Installation
```bash
# 1. Clone repository
git clone https://github.com/your-username/queueflow.git
cd queueflow

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env

# 4. Initialize Database & Seed Sample Records
node prisma/seed.js

# 5. Start development server
pnpm dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 5. Seed Credentials (One-Click Demo Access)

The seed script creates two isolated manager accounts for testing tenant isolation:

| Account | Email | Password | Role / Purpose |
| :--- | :--- | :--- | :--- |
| **Manager A** | `alex@queueflow.com` | `password123` | General Enquiry, Billing, VIP Concierge |
| **Manager B** | `sarah@queueflow.com` | `password123` | Clinical & Specialist Desk |

*(The login screen also includes convenient **One-Click Demo Fill** buttons for immediate testing).*

---

## 6. Testing

### Run Unit and Integration Tests
```bash
# Run all Vitest suites (Domain logic, State machine, Auth, React components)
pnpm test
```

### Run Playwright End-to-End Tests
```bash
# Run all 10 end-to-end scenarios
pnpm test:e2e
```

---

## 7. Production Build & Deployment

### Production Build
```bash
pnpm build
pnpm start
```

### PostgreSQL Deployment (Vercel + Supabase / Neon / Railway)
1. Provision a PostgreSQL database instance on [Supabase](https://supabase.com), [Neon](https://neon.tech), or [Railway](https://railway.app).
2. Set your environment variables in your deployment dashboard:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/queueflow?sslmode=require"
   AUTH_SECRET="your-32-character-secret-key"
   NEXTAUTH_URL="https://your-domain.vercel.app"
   ```
3. Run database migrations:
   ```bash
   pnpm prisma:deploy
   ```

---

## 8. API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Register a new manager and auto-provision default queue |
| `/api/auth/login` | `POST` | Sign in and receive secure session cookie |
| `/api/auth/logout` | `POST` | Clear session cookie |
| `/api/auth/me` | `GET` | Get authenticated manager profile |
| `/api/queues` | `GET`, `POST` | List queues with live counts / Create queue |
| `/api/queues/:id` | `GET`, `PATCH`, `DELETE` | Queue detail, update settings, delete |
| `/api/queues/:id/tokens` | `GET`, `POST` | List queue tokens / Issue new customer token |
| `/api/queues/:id/call-next`| `POST` | Atomically call the first waiting customer |
| `/api/queues/:id/reorder` | `POST` | Move token `UP` or `DOWN` within waiting queue |
| `/api/tokens/:id/start-service` | `POST` | Transition token to `SERVING` state |
| `/api/tokens/:id/complete`| `POST` | Transition token to `COMPLETED` state |
| `/api/tokens/:id/skip` | `POST` | Mark token as `SKIPPED` |
| `/api/tokens/:id/recall` | `POST` | Re-call a skipped/called token to counter |
| `/api/tokens/:id/cancel` | `POST` | Cancel token non-destructively with reason |
| `/api/analytics` | `GET` | Query aggregated KPIs, traffic, and wait trends |
| `/api/events` | `GET` | Server-Sent Events (SSE) real-time stream |
| `/api/health` | `GET` | Production health check and database latency probe |

---

## 9. Design System Palette

- **Parchment / Ivory**: `#FEFAE0`
- **Champagne Bisque**: `#FAEDCD`
- **Soft Sage**: `#CCD5AE`
- **Pale Celery**: `#E9EDC9`
- **Warm Ochre / Cognac**: `#D4A373`
- **High-Contrast Charcoal**: `#1F2421` (AAA accessibility compliant)
