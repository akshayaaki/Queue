-- QueueFlow PostgreSQL Schema Initialization for Supabase
-- Run this script directly in the Supabase SQL Editor if you want to initialize tables manually.

CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MANAGER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "queues" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "queueCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "ownerId" TEXT NOT NULL,
    "nextTokenNumber" INTEGER NOT NULL DEFAULT 1,
    "capacity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "queues_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tokens" (
    "id" TEXT NOT NULL,
    "queueId" TEXT NOT NULL,
    "tokenNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "position" INTEGER NOT NULL DEFAULT 0,
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calledAt" TIMESTAMP(3),
    "serviceStartedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "skippedAt" TIMESTAMP(3),
    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "queue_events" (
    "id" TEXT NOT NULL,
    "queueId" TEXT NOT NULL,
    "tokenId" TEXT,
    "userId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "queue_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE INDEX IF NOT EXISTS "queues_ownerId_idx" ON "queues"("ownerId");
CREATE INDEX IF NOT EXISTS "queues_status_idx" ON "queues"("status");
CREATE UNIQUE INDEX IF NOT EXISTS "queues_ownerId_queueCode_key" ON "queues"("ownerId", "queueCode");

CREATE INDEX IF NOT EXISTS "tokens_queueId_status_idx" ON "tokens"("queueId", "status");
CREATE INDEX IF NOT EXISTS "tokens_queueId_position_idx" ON "tokens"("queueId", "position");
CREATE INDEX IF NOT EXISTS "tokens_createdAt_idx" ON "tokens"("createdAt");

CREATE INDEX IF NOT EXISTS "queue_events_queueId_idx" ON "queue_events"("queueId");
CREATE INDEX IF NOT EXISTS "queue_events_tokenId_idx" ON "queue_events"("tokenId");
CREATE INDEX IF NOT EXISTS "queue_events_createdAt_idx" ON "queue_events"("createdAt");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'queues_ownerId_fkey') THEN
        ALTER TABLE "queues" ADD CONSTRAINT "queues_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tokens_queueId_fkey') THEN
        ALTER TABLE "tokens" ADD CONSTRAINT "tokens_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "queues"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'queue_events_queueId_fkey') THEN
        ALTER TABLE "queue_events" ADD CONSTRAINT "queue_events_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "queues"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'queue_events_tokenId_fkey') THEN
        ALTER TABLE "queue_events" ADD CONSTRAINT "queue_events_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "tokens"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'queue_events_userId_fkey') THEN
        ALTER TABLE "queue_events" ADD CONSTRAINT "queue_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
