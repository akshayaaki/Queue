import { NextRequest, NextResponse } from "next/server";
import { getSession, assertQueueOwnership } from "@/lib/auth";
import { QueueEngine } from "@/lib/queue-engine";

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

    const result = await QueueEngine.callNext(params.id, session.id);

    if (!result.success) {
      return NextResponse.json(
        { message: result.message, token: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      message: result.message,
      token: result.token,
    });
  } catch (error: any) {
    if (error.message === "QUEUE_NOT_FOUND_OR_FORBIDDEN") {
      return NextResponse.json(
        { error: "Queue not found or unauthorized access" },
        { status: 404 }
      );
    }
    console.error("[Call Next Error]:", error);
    return NextResponse.json(
      { error: "Failed to call next customer" },
      { status: 500 }
    );
  }
}
