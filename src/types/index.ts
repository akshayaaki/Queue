export type TokenStatus =
  | "WAITING"
  | "CALLED"
  | "SERVING"
  | "COMPLETED"
  | "CANCELLED"
  | "SKIPPED";

export type QueueStatus = "ACTIVE" | "PAUSED" | "INACTIVE" | "ARCHIVED";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface QueueSummary {
  id: string;
  name: string;
  description: string | null;
  queueCode: string;
  status: QueueStatus;
  ownerId: string;
  nextTokenNumber: number;
  capacity: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    tokens: number;
  };
  metrics?: {
    waitingCount: number;
    servingCount: number;
    completedCount: number;
    cancelledCount: number;
    avgWaitTimeMs: number;
  };
}

export interface TokenItem {
  id: string;
  queueId: string;
  tokenNumber: string;
  customerName: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  status: TokenStatus;
  position: number;
  cancellationReason: string | null;
  createdAt: string | Date;
  calledAt: string | Date | null;
  serviceStartedAt: string | Date | null;
  completedAt: string | Date | null;
  cancelledAt: string | Date | null;
  skippedAt: string | Date | null;
}

export interface QueueDetail extends QueueSummary {
  tokens: TokenItem[];
  currentlyServing?: TokenItem | null;
  nextUp?: TokenItem | null;
}

export interface QueueEventItem {
  id: string;
  queueId: string;
  tokenId: string | null;
  userId: string;
  eventType: string;
  eventData: string | null;
  createdAt: string | Date;
  user?: {
    name: string;
    email: string;
  };
}

export interface AnalyticsOverview {
  totalServed: number;
  currentWaiting: number;
  avgWaitTimeMs: number;
  avgServiceTimeMs: number;
  totalCancelled: number;
  totalTokens: number;
  completionRate: number;
  hourlyTraffic: {
    hour: string;
    count: number;
  }[];
  waitTimeTrends: {
    date: string;
    avgWaitMinutes: number;
  }[];
  queueComparisons: {
    queueName: string;
    queueCode: string;
    waiting: number;
    completed: number;
    cancelled: number;
  }[];
  serviceEfficiency: {
    hour: string;
    servedCount: number;
    avgDurationMinutes: number;
  }[];
}
