import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession, assertQueueOwnership } from "@/lib/auth";
import { addCustomerSchema } from "@/schemas";
import { QueueEngine } from "@/lib/queue-engine";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await assertQueueOwnership(params.id, session.id);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();

    const where: any = { queueId: params.id };
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { tokenNumber: { contains: search } },
        { customerName: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const tokens = await prisma.token.findMany({
      where,
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ tokens });
  } catch (error: any) {
    if (error.message === "QUEUE_NOT_FOUND_OR_FORBIDDEN") {
      return NextResponse.json(
        { error: "Queue not found or unauthorized access" },
        { status: 404 }
      );
    }
    console.error("[GET Queue Tokens Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch tokens" },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const payload = { ...body, queueId: params.id };
    const validated = addCustomerSchema.safeParse(payload);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const token = await QueueEngine.addCustomer({
      queueId: params.id,
      userId: session.id,
      customerName: validated.data.customerName,
      phone: validated.data.phone,
      email: validated.data.email,
      notes: validated.data.notes,
    });

    return NextResponse.json({ token }, { status: 201 });
  } catch (error: any) {
    if (error.message === "QUEUE_CAPACITY_REACHED") {
      return NextResponse.json(
        { error: "This queue has reached its maximum capacity" },
        { status: 422 }
      );
    }
    if (error.message?.startsWith("QUEUE_NOT_ACTIVE")) {
      return NextResponse.json(
        { error: "Cannot add customers to an inactive or paused queue" },
        { status: 400 }
      );
    }
    console.error("[POST Add Customer Error]:", error);
    return NextResponse.json(
      { error: "Failed to add customer to queue" },
      { status: 500 }
    );
  }
}
