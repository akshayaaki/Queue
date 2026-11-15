-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MANAGER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queues" (
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

-- CreateTable
CREATE TABLE "tokens" (
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

-- CreateTable
CREATE TABLE "queue_events" (
    "id" TEXT NOT NULL,
    "queueId" TEXT NOT NULL,
    "tokenId" TEXT,
    "userId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "queue_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "queues_ownerId_idx" ON "queues"("ownerId");

-- CreateIndex
CREATE INDEX "queues_status_idx" ON "queues"("status");

-- CreateIndex
CREATE UNIQUE INDEX "queues_ownerId_queueCode_key" ON "queues"("ownerId", "queueCode");

-- CreateIndex
CREATE INDEX "tokens_queueId_status_idx" ON "tokens"("queueId", "status");

-- CreateIndex
CREATE INDEX "tokens_queueId_position_idx" ON "tokens"("queueId", "position");

-- CreateIndex
CREATE INDEX "tokens_createdAt_idx" ON "tokens"("createdAt");

-- CreateIndex
CREATE INDEX "queue_events_queueId_idx" ON "queue_events"("queueId");

-- CreateIndex
CREATE INDEX "queue_events_tokenId_idx" ON "queue_events"("tokenId");

-- CreateIndex
CREATE INDEX "queue_events_createdAt_idx" ON "queue_events"("createdAt");

-- AddForeignKey
ALTER TABLE "queues" ADD CONSTRAINT "queues_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "queues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_events" ADD CONSTRAINT "queue_events_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "queues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_events" ADD CONSTRAINT "queue_events_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "tokens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_events" ADD CONSTRAINT "queue_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
