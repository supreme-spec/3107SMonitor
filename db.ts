import "dotenv/config";
import { PrismaClient } from "@prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

let prismaInstance: PrismaClient | undefined = global.__prisma;

if (!prismaInstance) {
  prismaInstance = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });
  if (process.env.NODE_ENV !== "production") {
    global.__prisma = prismaInstance;
  }
}

export const prisma = new Proxy(prismaInstance, {
  get(target, prop) {
    return prismaInstance[prop as keyof PrismaClient];
  },
  set(target, prop, value) {
    (prismaInstance as any)[prop as keyof PrismaClient] = value;
    return true;
  },
  has(target, prop) {
    return prop in prismaInstance;
  },
});

export async function reconnectPrisma(): Promise<void> {
  await prismaInstance.$disconnect();
  prismaInstance = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });
  if (process.env.NODE_ENV !== "production") {
    global.__prisma = prismaInstance;
  }
  if (process.env.NODE_ENV !== "production") {
    console.log("[db.ts] Prisma reconnected after DB restore");
  }
}

process.on("beforeExit", async () => {
  await prismaInstance.$disconnect();
});
