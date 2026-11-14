import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { registerSchema } from "@/schemas";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";

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

    // Check duplicate
    const existing = await prisma.user.findUnique({
      where: { email },
    });

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
        email,
        passwordHash,
        role: "MANAGER",
      },
    });

    // Automatically create a default queue for new managers
    await prisma.queue.create({
      data: {
        name: "General Enquiry",
        description: "Primary visitor registration and customer counter",
        queueCode: "GEN",
        status: "ACTIVE",
        ownerId: user.id,
        nextTokenNumber: 1,
      },
    });

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = await createSessionToken(sessionUser);
    await setSessionCookie(token);

    return NextResponse.json(
      {
        message: "Registration successful",
        user: sessionUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Register API Error]:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}
