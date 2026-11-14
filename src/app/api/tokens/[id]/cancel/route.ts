import { NextRequest, NextResponse } from "next/server";
import { getSession, assertTokenOwnership } from "@/lib/auth";
import { cancelTokenSchema } from "@/schemas";
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
    await assertTokenOwnership(params.id, session.id);

    const body = await req.json().catch(() => ({}));
    const validated = cancelTokenSchema.safeParse(body);

    const reason = validated.success ? validated.data.reason : null;

    const updated = await QueueEngine.cancelToken(params.id, session.id, reason);
    return NextResponse.json({ token: updated });
  } catch (error: any) {
    if (error.message === "TOKEN_NOT_FOUND_OR_FORBIDDEN") {
      return NextResponse.json({ error: "Token not found or unauthorized" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || "Failed to cancel token" }, { status: 400 });
  }
}
