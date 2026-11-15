import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { loginSchema } from "@/schemas";
import {
  comparePassword,
  createSessionToken,
  setSessionCookie,
  getCookieOptions,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid login credentials", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = validated.data;

    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
    } catch (dbError: any) {
      console.error("[Login Database Error]:", dbError.message);
      return NextResponse.json(
        {
          error: "Database connection failed. Please ensure your environment is configured correctly.",
        },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || "MANAGER",
    };

    const token = await createSessionToken(sessionUser);

    // 1. Set cookie in next/headers
    await setSessionCookie(token);

    // 2. Explicitly attach Set-Cookie on NextResponse for Netlify/serverless compatibility
    const response = NextResponse.json({
      message: "Login successful",
      user: sessionUser,
    });

    const isHttps =
      req.headers.get("x-forwarded-proto") === "https" ||
      req.url.startsWith("https://") ||
      process.env.NODE_ENV === "production";

    response.cookies.set({
      name: "queueflow_session",
      value: token,
      ...getCookieOptions(isHttps),
    });

    return response;
  } catch (error: any) {
    console.error("[Login API Error]:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during login" },
      { status: 500 }
    );
  }
}
