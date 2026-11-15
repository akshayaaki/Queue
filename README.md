# QueueFlow Pro

> **A Precision, High-Throughput Queue Management Platform**  
> Engineered with Next.js 14 App Router, TypeScript, Prisma ORM, Server-Sent Events (SSE) Real-Time Synchronization, and Multi-Tenant Manager Isolation.

Designed with a modern, high-ticket white SaaS aesthetic (Slate / Pure White / Electric Blue `#2563eb`).

---

## 1. Executive Summary & Capabilities

**QueueFlow** provides high-reliability queue telemetry and operational dispatch for enterprise counters, clinic lobbies, customer service desks, and intake centers.

### Key Highlights
- **Atomic Token Generation & Sequencing**: Sequential numbering prefixes (e.g., `GEN-001`, `BIL-042`, `VIP-003`) allocated atomically inside transactions.
- **Concurrency-Safe Dispatch ("Call Next")**: Guaranteed single-assignment under simultaneous manager requests with row compaction.
- **Bi-Directional Waiting Queue Reordering**: Instant Move Up / Move Down repositioning strictly restricted to waiting customers.
- **Full Service Lifecycle State Machine**: Enforces strict transitions:
  $$\text{WAITING} \longrightarrow \text{CALLED} \longrightarrow \text{SERVING} \longrightarrow \text{COMPLETED}$$
  with non-destructive cancellation and audit trail preservation.
- **Zero-Latency Real-Time Synchronization**: Native Server-Sent Events (SSE) broadcaster keeps multiple tabs, desks, and waiting screens synchronized in real time.
- **Live Acoustic Chime**: Synthesized dual-tone harmonic lounge chime (F#5 $\to$ C#6) via the Web Audio API without external audio files.
- **Database-Backed Analytics**: Real SQL aggregations for wait time ($\text{calledAt} - \text{createdAt}$), service duration ($\text{completedAt} - \text{serviceStartedAt}$), hourly throughput, and queue comparison.
- **Multi-Tenant Manager Isolation**: Strict server-side verification ensuring managers can access only their authorized queues.
- **Zero-Config Resilient Fallback Engine**: Works out-of-the-box in serverless and containerized environments. When `DATABASE_URL` is configured, it automatically switches to PostgreSQL via Prisma.

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
│  PostgreSQL   │ (Production)│ Resilient DB  │ (Zero-Config Fallback)
│  (Supabase /  │             │   Runtime     │
│  Neon / RDS)  │             │               │
└───────────────┘             └───────────────┘
```

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript Strict, Tailwind CSS, Lucide Icons, Recharts, Sonner Toaster |
| **Backend** | Next.js Route Handlers, Jose JWT Sessions, Bcrypt.js, Zod Schema Validation |
| **Database** | PostgreSQL (Production via Prisma) / Resilient Runtime Engine |
| **Realtime** | Server-Sent Events (SSE) HTTP stream with auto-reconnect & heartbeats |
| **Audio** | Web Audio API Synthesizer (Harmonic bell chime) |
| **Testing** | Vitest 2, React Testing Library, JSDOM |

---

## 3. Quick Start & Local Development

### Prerequisites
- Node.js 18.17+ or 20.x
- pnpm or npm

### Installation
```bash
# 1. Clone repository
git clone https://github.com/akshayaaki/Queue.git
cd Queue

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env

# 4. Start development server
pnpm dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 4. Manager Registration & Authentication

1. Navigate to `/register` to create your initial manager account.
2. Sign in at `/login` with your registered credentials.
3. Once logged in, create your queues (e.g. `General Desk`, `Billing`, `VIP Lounge`) with custom prefix codes.
4. Add customer tokens and use the **Call Next**, **Start Service**, **Complete**, or **Reorder** buttons to manage the live flow.

---

## 5. Testing

### Run Unit and Integration Tests
```bash
# Run all Vitest suites (Domain logic, State machine, Auth, React components)
pnpm test
```

---

## 6. Production Deployment (Netlify / Vercel / Railway)

1. Connect your repository to Netlify or Vercel.
2. Set your environment variables in your deployment dashboard:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/queueflow?sslmode=require"
   AUTH_SECRET="your-32-character-secret-key-at-least-32-chars"
   NEXTAUTH_URL="https://your-domain.netlify.app"
   ```
3. When `DATABASE_URL` is set, run database migrations:
   ```bash
   pnpm prisma migrate deploy
   ```
4. If `DATABASE_URL` is not yet configured, QueueFlow will seamlessly run on its resilient runtime storage engine without throwing 500 errors.

---

## 7. API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Register a new manager |
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

## 8. Design System

- **Background**: `#FFFFFF` (Pure White) / `#F8FAFC` (Slate-50)
- **Cards**: `#FFFFFF` with `#E2E8F0` (Slate-200) borders and soft depth shadows
- **Primary Accent**: `#2563EB` (Electric Blue-600)
- **Status Indicators**:
  - Waiting: Amber (`#F59E0B`)
  - Called: Pulsing Blue (`#2563EB`)
  - Serving: Indigo (`#6366F1`)
  - Completed: Emerald (`#10B981`)
  - Cancelled: Rose (`#F43F5E`)
  - Skipped: Slate (`#64748B`)
