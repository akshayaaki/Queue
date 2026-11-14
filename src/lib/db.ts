import { PrismaClient } from "@prisma/client";
import { memoryPrisma } from "./memory-store";

declare global {
  // eslint-disable-next-line no-var
  var __real_prisma__: PrismaClient | undefined;
}

function getRealPrisma(): PrismaClient | null {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.trim() === "") {
    return null;
  }

  if (globalThis.__real_prisma__) {
    return globalThis.__real_prisma__;
  }

  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
    globalThis.__real_prisma__ = client;
    return client;
  } catch (err: any) {
    console.warn("[Prisma Init Warning]:", err.message);
    return null;
  }
}

/**
 * QueueFlow Smart Prisma Proxy:
 * Dispatches to real Prisma / PostgreSQL when available;
 * Seamlessly fails over to persistent memory engine when database is offline or unprovisioned.
 */
export const prisma: any = new Proxy(
  {},
  {
    get(_target, prop: string) {
      if (prop === "$transaction") {
        return async (callback: any) => {
          const client = getRealPrisma();
          if (client) {
            try {
              return await client.$transaction(callback);
            } catch (err: any) {
              console.warn(
                "[DB Proxy] Prisma $transaction failed, routing to resilient memory store:",
                err.message
              );
              return await memoryPrisma.$transaction(callback);
            }
          }
          return await memoryPrisma.$transaction(callback);
        };
      }

      if (prop === "$queryRaw") {
        return async (...args: any[]) => {
          const client = getRealPrisma();
          if (client) {
            try {
              return await (client as any).$queryRaw(...args);
            } catch {
              return await memoryPrisma.$queryRaw();
            }
          }
          return await memoryPrisma.$queryRaw();
        };
      }

      if (prop === "$disconnect") {
        return async () => {
          const client = getRealPrisma();
          if (client) {
            try {
              await client.$disconnect();
            } catch {}
          }
        };
      }

      const model = prop;
      return new Proxy(
        {},
        {
          get(_mTarget, method: string) {
            return async (...args: any[]) => {
              const client = getRealPrisma();
              if (client && (client as any)[model]?.[method]) {
                try {
                  return await (client as any)[model][method](...args);
                } catch (err: any) {
                  console.warn(
                    `[DB Proxy] Prisma ${model}.${method} failed (${err.message}), routing to resilient memory store.`
                  );
                  const fallbackModel = (memoryPrisma as any)[model];
                  if (fallbackModel?.[method]) {
                    return await fallbackModel[method](...args);
                  }
                  throw err;
                }
              }

              const fallbackModel = (memoryPrisma as any)[model];
              if (fallbackModel?.[method]) {
                return await fallbackModel[method](...args);
              }
              throw new Error(`Unsupported model or method on DB store: ${model}.${method}`);
            };
          },
        }
      );
    },
  }
);

export default prisma;
