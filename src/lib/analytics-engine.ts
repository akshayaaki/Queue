import prisma from "./db";

export interface AnalyticsFilter {
  ownerId: string;
  queueId?: string;
  period?: "today" | "7days" | "30days" | "all";
  startDate?: string;
  endDate?: string;
}

export class AnalyticsEngine {
  static getDateRange(period: string = "7days", startDate?: string, endDate?: string) {
    if (startDate && endDate) {
      return {
        from: new Date(startDate),
        to: new Date(endDate),
      };
    }

    const now = new Date();
    const to = new Date();

    if (period === "today") {
      const from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      return { from, to };
    }

    if (period === "30days") {
      const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { from, to };
    }

    if (period === "all") {
      const from = new Date(0);
      return { from, to };
    }

    // Default: 7days
    const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { from, to };
  }

  static async getOverview(filter: AnalyticsFilter) {
    const { ownerId, queueId, period, startDate, endDate } = filter;
    const { from, to } = this.getDateRange(period, startDate, endDate);

    // Tenant check: only include queues belonging to this owner
    const managerQueues = await prisma.queue.findMany({
      where: {
        ownerId,
        ...(queueId ? { id: queueId } : {}),
      },
      select: { id: true, name: true, queueCode: true },
    });

    const queueIds = managerQueues.map((q) => q.id);

    if (queueIds.length === 0) {
      return {
        totalServed: 0,
        currentWaiting: 0,
        avgWaitTimeMs: 0,
        avgServiceTimeMs: 0,
        totalCancelled: 0,
        totalTokens: 0,
        completionRate: 0,
        hourlyTraffic: [],
        waitTimeTrends: [],
        queueComparisons: [],
        serviceEfficiency: [],
      };
    }

    // 1. Current Waiting tokens (real-time snapshot)
    const currentWaiting = await prisma.token.count({
      where: {
        queueId: { in: queueIds },
        status: "WAITING",
      },
    });

    // 2. Tokens created in period
    const tokensInPeriod = await prisma.token.findMany({
      where: {
        queueId: { in: queueIds },
        createdAt: { gte: from, lte: to },
      },
      select: {
        id: true,
        queueId: true,
        status: true,
        createdAt: true,
        calledAt: true,
        serviceStartedAt: true,
        completedAt: true,
        cancelledAt: true,
      },
    });

    const totalTokens = tokensInPeriod.length;

    // Completed tokens
    const completedTokens = tokensInPeriod.filter((t) => t.status === "COMPLETED");
    const totalServed = completedTokens.length;

    // Cancelled tokens
    const cancelledTokens = tokensInPeriod.filter((t) => t.status === "CANCELLED");
    const totalCancelled = cancelledTokens.length;

    // Completion Rate (avoid divide by zero)
    const finishedTokensCount = totalServed + totalCancelled;
    const completionRate =
      finishedTokensCount > 0 ? Math.round((totalServed / finishedTokensCount) * 100) : 0;

    // Average Waiting Time (calledAt - createdAt) for tokens that were called
    let totalWaitTimeMs = 0;
    let waitTokensCount = 0;

    tokensInPeriod.forEach((t) => {
      if (t.calledAt) {
        const diff = new Date(t.calledAt).getTime() - new Date(t.createdAt).getTime();
        if (diff >= 0) {
          totalWaitTimeMs += diff;
          waitTokensCount++;
        }
      }
    });

    const avgWaitTimeMs = waitTokensCount > 0 ? Math.round(totalWaitTimeMs / waitTokensCount) : 0;

    // Average Service Time (completedAt - serviceStartedAt)
    let totalServiceTimeMs = 0;
    let serviceTokensCount = 0;

    completedTokens.forEach((t) => {
      if (t.completedAt && t.serviceStartedAt) {
        const diff =
          new Date(t.completedAt).getTime() - new Date(t.serviceStartedAt).getTime();
        if (diff >= 0) {
          totalServiceTimeMs += diff;
          serviceTokensCount++;
        }
      }
    });

    const avgServiceTimeMs =
      serviceTokensCount > 0 ? Math.round(totalServiceTimeMs / serviceTokensCount) : 0;

    // Hourly Traffic Distribution (00:00 to 23:00)
    const hourlyMap: Record<number, number> = {};
    for (let h = 8; h <= 18; h++) {
      hourlyMap[h] = 0;
    }

    tokensInPeriod.forEach((t) => {
      const h = new Date(t.createdAt).getHours();
      hourlyMap[h] = (hourlyMap[h] || 0) + 1;
    });

    const hourlyTraffic = Object.entries(hourlyMap)
      .map(([hour, count]) => {
        const h = parseInt(hour, 10);
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        return {
          hour: `${h12} ${ampm}`,
          count,
          rawHour: h,
        };
      })
      .sort((a, b) => a.rawHour - b.rawHour)
      .map(({ hour, count }) => ({ hour, count }));

    // Wait Time Trends by Day
    const dayMap: Record<string, { totalMs: number; count: number }> = {};

    tokensInPeriod.forEach((t) => {
      if (t.calledAt) {
        const dayStr = new Date(t.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        if (!dayMap[dayStr]) {
          dayMap[dayStr] = { totalMs: 0, count: 0 };
        }
        const diff = new Date(t.calledAt).getTime() - new Date(t.createdAt).getTime();
        if (diff >= 0) {
          dayMap[dayStr].totalMs += diff;
          dayMap[dayStr].count++;
        }
      }
    });

    const waitTimeTrends = Object.entries(dayMap).map(([date, data]) => ({
      date,
      avgWaitMinutes:
        data.count > 0 ? Math.round((data.totalMs / data.count / (1000 * 60)) * 10) / 10 : 0,
    }));

    // Queue Performance Comparison
    const queueComparisons = await Promise.all(
      managerQueues.map(async (q) => {
        const [waiting, completed, cancelled] = await Promise.all([
          prisma.token.count({ where: { queueId: q.id, status: "WAITING" } }),
          prisma.token.count({
            where: { queueId: q.id, status: "COMPLETED", createdAt: { gte: from, lte: to } },
          }),
          prisma.token.count({
            where: { queueId: q.id, status: "CANCELLED", createdAt: { gte: from, lte: to } },
          }),
        ]);

        return {
          queueName: q.name,
          queueCode: q.queueCode,
          waiting,
          completed,
          cancelled,
        };
      })
    );

    // Service Efficiency by Hour
    const efficiencyMap: Record<number, { served: number; totalDurationMs: number }> = {};
    for (let h = 9; h <= 17; h++) {
      efficiencyMap[h] = { served: 0, totalDurationMs: 0 };
    }

    completedTokens.forEach((t) => {
      if (t.completedAt && t.serviceStartedAt) {
        const h = new Date(t.completedAt).getHours();
        const duration =
          new Date(t.completedAt).getTime() - new Date(t.serviceStartedAt).getTime();
        if (duration >= 0) {
          if (!efficiencyMap[h]) {
            efficiencyMap[h] = { served: 0, totalDurationMs: 0 };
          }
          efficiencyMap[h].served++;
          efficiencyMap[h].totalDurationMs += duration;
        }
      }
    });

    const serviceEfficiency = Object.entries(efficiencyMap)
      .map(([hour, data]) => {
        const h = parseInt(hour, 10);
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        return {
          hour: `${h12} ${ampm}`,
          servedCount: data.served,
          avgDurationMinutes:
            data.served > 0
              ? Math.round((data.totalDurationMs / data.served / (1000 * 60)) * 10) / 10
              : 0,
          rawHour: h,
        };
      })
      .sort((a, b) => a.rawHour - b.rawHour)
      .map(({ hour, servedCount, avgDurationMinutes }) => ({
        hour,
        servedCount,
        avgDurationMinutes,
      }));

    return {
      totalServed,
      currentWaiting,
      avgWaitTimeMs,
      avgServiceTimeMs,
      totalCancelled,
      totalTokens,
      completionRate,
      hourlyTraffic,
      waitTimeTrends,
      queueComparisons,
      serviceEfficiency,
    };
  }
}
