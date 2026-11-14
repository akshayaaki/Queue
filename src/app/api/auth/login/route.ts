import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { loginSchema } from "@/schemas";
import { comparePassword, createSessionToken, setSessionCookie } from "@/lib/auth";

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

    let user = await prisma.user.findUnique({
      where: { email },
    });

    // Auto-provision demo manager if not found or if database was reset
    if (!user && (email === "alex@queueflow.com" || email === "sarah@queueflow.com") && password === "password123") {
      const passwordHash = await hashPassword("password123");
      const isAlex = email === "alex@queueflow.com";
      user = await prisma.user.create({
        data: {
          name: isAlex ? "Alex Vance" : "Dr. Sarah Chen",
          email,
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
      role: user.role,
    };

    const token = await createSessionToken(sessionUser);
    await setSessionCookie(token);

    return NextResponse.json({
      message: "Login successful",
      user: sessionUser,
    });
  } catch (error: any) {
    console.error("[Login API Error]:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login" },
      { status: 500 }
    );
  }
}
