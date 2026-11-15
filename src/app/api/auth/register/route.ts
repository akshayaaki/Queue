import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { registerSchema } from "@/schemas";
import {
  hashPassword,
  createSessionToken,
  setSessionCookie,
  getCookieOptions,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = validated.data;

    let existing = null;
    try {
      existing = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
    } catch (dbErr: any) {
      console.error("[Register Database Error]:", dbErr.message);
      return NextResponse.json(
        {
          error: "Database service unavailable. Please check your database connection or environment variables.",
        },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: "MANAGER",
      },
    });

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || "MANAGER",
    };

    const token = await createSessionToken(sessionUser);
    await setSessionCookie(token);

    const isHttps =
      req.headers.get("x-forwarded-proto") === "https" ||
      req.url.startsWith("https://") ||
      process.env.NODE_ENV === "production";

    const response = NextResponse.json(
      {
        message: "Registration successful",
        user: sessionUser,
      },
      { status: 201 }
    );

    response.cookies.set({
      name: "queueflow_session",
      value: token,
      ...getCookieOptions(isHttps),
    });

    return response;
  } catch (error: any) {
    console.error("[Register API Error]:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}
