import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { loginSchema } from "@/schemas";
import {
  hashPassword,
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
    const isAlex = email.toLowerCase() === "alex@queueflow.com";
    const isSarah = email.toLowerCase() === "sarah@queueflow.com";
    const isDemoAccount = (isAlex || isSarah) && password === "password123";

    let user: any = null;
    let dbConnected = true;

    try {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      // Auto-provision demo manager if not found in database
      if (!user && isDemoAccount) {
        const passwordHash = await hashPassword("password123");
        user = await prisma.user.create({
          data: {
            name: isAlex ? "Alex Vance" : "Dr. Sarah Chen",
            email: email.toLowerCase(),
            passwordHash,
            role: "MANAGER",
          },
        });

        // Create initial queue for demo manager
        await prisma.queue.create({
          data: {
            name: isAlex ? "General Enquiry" : "Clinical Consultation",
            description: isAlex ? "Front-desk general intake and visitor registration" : "Specialist appointments",
            queueCode: isAlex ? "GEN" : "MED",
            status: "ACTIVE",
            ownerId: user.id,
            nextTokenNumber: 1,
          },
        });
      }
    } catch (dbError: any) {
      console.warn("[Login Database Warning]:", dbError.message);
      dbConnected = false;

      // Resilient fallback: allow demo managers to log in even if PostgreSQL is pending connection
      if (isDemoAccount) {
        user = {
          id: isAlex ? "usr_alex_vance" : "usr_sarah_chen",
          name: isAlex ? "Alex Vance" : "Dr. Sarah Chen",
          email: email.toLowerCase(),
          passwordHash: null,
          role: "MANAGER",
        };
      } else {
        const isMissingUrl = !process.env.DATABASE_URL;
        return NextResponse.json(
          {
            error: isMissingUrl
              ? "DATABASE_URL is not configured in Netlify environment variables. Please configure DATABASE_URL in Netlify Site Configuration."
              : `Database error: ${dbError.message || "Failed to reach database"}.`,
            code: isMissingUrl ? "MISSING_DATABASE_URL" : "DB_CONNECTION_ERROR",
          },
          { status: 500 }
        );
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password if user has hashed password (demo fallback skips since password was already matched)
    if (user.passwordHash) {
      const isValid = await comparePassword(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = await createSessionToken(sessionUser);

    // 1. Set cookie in next/headers
    await setSessionCookie(token);

    // 2. Explicitly attach Set-Cookie on NextResponse for Netlify/serverless compatibility
    const response = NextResponse.json({
      message: "Login successful",
      user: sessionUser,
      dbStatus: dbConnected ? "connected" : "demo-mode",
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
