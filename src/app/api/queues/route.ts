import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { createQueueSchema } from "@/schemas";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim();
  const status = searchParams.get("status")?.trim();

  try {
    const effectiveUserId =
      session.id === "demo-manager-alex" ? "usr_alex_vance" :
      session.id === "demo-manager-sarah" ? "usr_sarah_chen" :
      session.id;

    const whereClause: any = {
      OR: [
        { ownerId: effectiveUserId },
        { ownerId: session.id },
      ],
    };

    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    if (search) {
      whereClause.AND = [
        {
          OR: [
            { name: { contains: search } },
            { queueCode: { contains: search } },
            { description: { contains: search } },
          ],
        },
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
    const queuesList = (queues as any[]) || [];
    const queuesWithMetrics = await Promise.all(
      queuesList.map(async (queue: any) => {
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
        const calledTokens = (await prisma.token.findMany({
          where: { queueId: queue.id, calledAt: { not: null } },
          select: { createdAt: true, calledAt: true },
          take: 50,
        })) as any[];

        let avgWaitTimeMs = 0;
        if (calledTokens && calledTokens.length > 0) {
          const totalMs = calledTokens.reduce((sum: number, t: any) => {
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
    console.warn("[GET Queues Notice]:", error.message);
    // If database is unavailable, provide default queue so dashboard is immediately accessible
    if (session.email === "alex@queueflow.com" || session.email === "sarah@queueflow.com" || !process.env.DATABASE_URL) {
      const isSarah = session.email === "sarah@queueflow.com";
      return NextResponse.json({
        queues: [
          {
            id: isSarah ? "queue-med-demo" : "queue-gen-demo",
            name: isSarah ? "Clinical Consultation" : "General Enquiry",
            description: isSarah ? "Specialist appointments and physician reviews" : "Front-desk general intake and visitor registration",
            queueCode: isSarah ? "MED" : "GEN",
            status: "ACTIVE",
            capacity: 50,
            nextTokenNumber: 6,
            ownerId: session.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            _count: { tokens: 4 },
            metrics: {
              waitingCount: 3,
              servingCount: 1,
              completedCount: 18,
              cancelledCount: 1,
              avgWaitTimeMs: 380000,
            },
          },
        ],
      });
    }

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
