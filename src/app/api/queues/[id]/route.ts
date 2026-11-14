import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession, assertQueueOwnership } from "@/lib/auth";
import { updateQueueSchema } from "@/schemas";
import { eventBus } from "@/lib/events";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const queue = await assertQueueOwnership(params.id, session.id);

    // Fetch all active tokens
    const tokens = await prisma.token.findMany({
      where: { queueId: queue.id },
      orderBy: [
        { status: "asc" },
        { position: "asc" },
        { createdAt: "desc" },
      ],
    });

    const waitingTokens = tokens.filter((t) => t.status === "WAITING").sort((a, b) => a.position - b.position);
    const currentlyServing = tokens.find((t) => t.status === "SERVING" || t.status === "CALLED") || null;
    const nextUp = waitingTokens[0] || null;

    const completedCount = tokens.filter((t) => t.status === "COMPLETED").length;
    const cancelledCount = tokens.filter((t) => t.status === "CANCELLED").length;
    const waitingCount = waitingTokens.length;

    // Average wait time
    const calledTokens = tokens.filter((t) => t.calledAt !== null);
    let avgWaitTimeMs = 0;
    if (calledTokens.length > 0) {
      const totalWait = calledTokens.reduce((acc, t) => {
        return acc + (new Date(t.calledAt!).getTime() - new Date(t.createdAt).getTime());
      }, 0);
      avgWaitTimeMs = Math.round(totalWait / calledTokens.length);
    }

    return NextResponse.json({
      queue: {
        ...queue,
        tokens,
        waitingTokens,
        currentlyServing,
        nextUp,
        metrics: {
          waitingCount,
          servingCount: currentlyServing ? 1 : 0,
          completedCount,
          cancelledCount,
          avgWaitTimeMs,
        },
      },
    });
  } catch (error: any) {
    if (error.message === "QUEUE_NOT_FOUND_OR_FORBIDDEN") {
      return NextResponse.json(
        { error: "Queue not found or unauthorized access" },
        { status: 404 }
      );
    }
    console.error("[GET Queue ID Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch queue details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await assertQueueOwnership(params.id, session.id);

    const body = await req.json();
    const validated = updateQueueSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await prisma.queue.update({
      where: { id: params.id },
      data: validated.data,
    });

    eventBus.broadcast(params.id, {
      type: "QUEUE_UPDATED",
      data: updated,
    });

    return NextResponse.json({ queue: updated });
  } catch (error: any) {
    if (error.message === "QUEUE_NOT_FOUND_OR_FORBIDDEN") {
      return NextResponse.json(
        { error: "Queue not found or unauthorized access" },
        { status: 404 }
      );
    }
    console.error("[PATCH Queue Error]:", error);
    return NextResponse.json(
      { error: "Failed to update queue" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await assertQueueOwnership(params.id, session.id);

    // Cascade delete via prisma
    await prisma.queue.delete({
      where: { id: params.id },
    });

    eventBus.broadcast(params.id, {
      type: "QUEUE_DELETED",
      data: { id: params.id },
    });

    return NextResponse.json({ message: "Queue deleted successfully" });
  } catch (error: any) {
    if (error.message === "QUEUE_NOT_FOUND_OR_FORBIDDEN") {
      return NextResponse.json(
        { error: "Queue not found or unauthorized access" },
        { status: 404 }
      );
    }
    console.error("[DELETE Queue Error]:", error);
    return NextResponse.json(
      { error: "Failed to delete queue" },
      { status: 500 }
    );
  }
}
