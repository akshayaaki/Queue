import { NextRequest } from "next/server";
import { eventBus } from "@/lib/events";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const queueId = searchParams.get("queueId") || "*";

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "CONNECTED", queueId, timestamp: Date.now() })}\n\n`)
      );

      // 2. Subscribe to event bus
      const unsubscribe = eventBus.subscribe(queueId, (event) => {
        try {
          const payload = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch (err) {
          console.error("[SSE Stream Push Error]:", err);
        }
      });

      // 3. Keep-alive heartbeat every 15 seconds
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 15000);

      // 4. Handle client disconnection
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        unsubscribe();
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
