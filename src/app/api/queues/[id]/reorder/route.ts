import { NextRequest, NextResponse } from "next/server";
import { getSession, assertQueueOwnership } from "@/lib/auth";
import { reorderTokenSchema } from "@/schemas";
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

    const body = await req.json();
    const validated = reorderTokenSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { tokenId, direction } = validated.data;

    const result = await QueueEngine.reorderToken({
      queueId: params.id,
      tokenId,
      userId: session.id,
      direction,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === "CANNOT_REORDER_NON_WAITING_TOKEN") {
      return NextResponse.json(
        { error: "Only WAITING tokens can be reordered" },
        { status: 400 }
      );
    }
    console.error("[Reorder Error]:", error);
    return NextResponse.json(
      { error: "Failed to reorder token" },
      { status: 500 }
    );
  }
}
