import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "healthy";
  let dbLatencyMs = 0;

  try {
    const dbCheckStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbCheckStart;
  } catch (error: any) {
    dbStatus = "unhealthy";
    console.error("[Health Check DB Error]:", error);
  }

  const status = dbStatus === "healthy" ? 200 : 503;

  return NextResponse.json(
    {
      status: dbStatus === "healthy" ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      environment: process.env.NODE_ENV,
      version: "1.0.0",
    },
    { status }
  );
}
