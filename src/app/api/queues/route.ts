import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { createQueueSchema } from "@/schemas";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim();
  const status = searchParams.get("status")?.trim();

  try {
    const whereClause: any = {
      ownerId: session.id,
    };

    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { queueCode: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const queues = await prisma.queue.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { tokens: true },
        },
      },
    });

    // Compute live metrics for each queue
    const queuesWithMetrics = await Promise.all(
      queues.map(async (queue) => {
        const [waitingCount, servingCount, completedCount, cancelledCount] =
          await Promise.all([
            prisma.token.count({ where: { queueId: queue.id, status: "WAITING" } }),
            prisma.token.count({
              where: { queueId: queue.id, status: { in: ["SERVING", "CALLED"] } },
            }),
            prisma.token.count({ where: { queueId: queue.id, status: "COMPLETED" } }),
            prisma.token.count({ where: { queueId: queue.id, status: "CANCELLED" } }),
          ]);

        // Calculate average wait time for completed/called tokens
        const calledTokens = await prisma.token.findMany({
          where: { queueId: queue.id, calledAt: { not: null } },
          select: { createdAt: true, calledAt: true },
          take: 50,
        });

        let avgWaitTimeMs = 0;
        if (calledTokens.length > 0) {
          const totalMs = calledTokens.reduce((sum, t) => {
            return sum + (new Date(t.calledAt!).getTime() - new Date(t.createdAt).getTime());
          }, 0);
          avgWaitTimeMs = Math.round(totalMs / calledTokens.length);
        }

        return {
          ...queue,
          metrics: {
            waitingCount,
            servingCount,
            completedCount,
            cancelledCount,
            avgWaitTimeMs,
          },
        };
      })
    );

    return NextResponse.json({ queues: queuesWithMetrics });
  } catch (error: any) {
    console.error("[GET Queues Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch queues" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = createQueueSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, description, queueCode, capacity } = validated.data;

    // Check duplicate code for this owner
    const existing = await prisma.queue.findFirst({
      where: {
        ownerId: session.id,
        queueCode,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `You already have a queue with code '${queueCode}'. Please choose another code.` },
        { status: 409 }
      );
    }

    const queue = await prisma.queue.create({
      data: {
        name,
        description: description || null,
        queueCode,
        capacity: capacity || null,
        ownerId: session.id,
        status: "ACTIVE",
        nextTokenNumber: 1,
      },
    });

    return NextResponse.json({ queue }, { status: 201 });
  } catch (error: any) {
    console.error("[POST Queue Error]:", error);
    return NextResponse.json(
      { error: "Failed to create queue" },
      { status: 500 }
    );
  }
}
