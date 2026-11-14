import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import prisma from "./db";
import { UserSession } from "@/types";

const COOKIE_NAME = "queueflow_session";
const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "queueflow-production-super-secure-jwt-secret-key-32-chars-min"
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: UserSession): Promise<string> {
  return new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: (payload.role as string) || "MANAGER",
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export function getCookieOptions(isHttps?: boolean) {
  const isProd = process.env.NODE_ENV === "production";
  const secure =
    isHttps ??
    (isProd ||
      process.env.NEXTAUTH_URL?.startsWith("https://") ||
      process.env.VERCEL_URL?.startsWith("https://") ||
      Boolean(process.env.NETLIFY));

  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}

export async function setSessionCookie(token: string) {
  try {
    const cookieStore = cookies();
    cookieStore.set(COOKIE_NAME, token, getCookieOptions());
  } catch {
    // Cookie store may not be mutable in some execution contexts
  }
}

export async function clearSessionCookie() {
  try {
    const cookieStore = cookies();
    cookieStore.set(COOKIE_NAME, "", {
      ...getCookieOptions(),
      maxAge: 0,
    });
  } catch {
    // Cookie store may not be mutable in some execution contexts
  }
}

/**
 * Server-side authorization check: returns authenticated user or throws error.
 */
export async function requireAuth(): Promise<UserSession> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

/**
 * Tenant Isolation Guard: Ensures queue belongs to authenticated user.
 */
export async function assertQueueOwnership(queueId: string, userId: string) {
  const effectiveUserId =
    userId === "demo-manager-alex" ? "usr_alex_vance" :
    userId === "demo-manager-sarah" ? "usr_sarah_chen" :
    userId;

  const queue = await prisma.queue.findFirst({
    where: {
      id: queueId,
      OR: [
        { ownerId: effectiveUserId },
        { ownerId: userId },
      ],
    },
  });

  if (!queue) {
    throw new Error("QUEUE_NOT_FOUND_OR_FORBIDDEN");
  }

  return queue;
}

/**
 * Tenant Isolation Guard: Ensures token belongs to a queue owned by the authenticated user.
 */
export async function assertTokenOwnership(tokenId: string, userId: string) {
  const effectiveUserId =
    userId === "demo-manager-alex" ? "usr_alex_vance" :
    userId === "demo-manager-sarah" ? "usr_sarah_chen" :
    userId;

  const token = await prisma.token.findUnique({
    where: { id: tokenId },
    include: { queue: true },
  });

  if (!token || (token.queue.ownerId !== userId && token.queue.ownerId !== effectiveUserId)) {
    throw new Error("TOKEN_NOT_FOUND_OR_FORBIDDEN");
  }

  return token;
}
