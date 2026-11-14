import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { analyticsQuerySchema } from "@/schemas";
import { AnalyticsEngine } from "@/lib/analytics-engine";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const parsed = analyticsQuerySchema.safeParse({
      queueId: searchParams.get("queueId") || undefined,
      period: searchParams.get("period") || "7days",
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const overview = await AnalyticsEngine.getOverview({
      ownerId: session.id,
      queueId: parsed.data.queueId,
      period: parsed.data.period,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
    });

    return NextResponse.json({ data: overview });
  } catch (error: any) {
    console.error("[Analytics API Error]:", error);
    return NextResponse.json(
      { error: "Failed to generate analytics data" },
      { status: 500 }
    );
  }
}
