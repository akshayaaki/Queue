import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, getCookieOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await clearSessionCookie();

  const response = NextResponse.json({ message: "Logged out successfully" });
  response.cookies.set({
    name: "queueflow_session",
    value: "",
    ...getCookieOptions(false),
    maxAge: 0,
  });

  return response;
}
