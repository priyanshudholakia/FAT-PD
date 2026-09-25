import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
let prisma;

if (connectionString) {
  try {
    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const globalForPrisma = globalThis;
    prisma =
      globalForPrisma.prisma ||
      new PrismaClient({
        adapter,
        log: ["query", "error", "warn"],
      });
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prisma;
    }
  } catch (err) {
    console.error("[DB Init Error] Failed to initialize Prisma with pg adapter:", err);
    prisma = new PrismaClient({ log: ["query", "error", "warn"] });
  }
} else {
  console.warn("[DB Warning] DATABASE_URL environment variable is not defined.");
  prisma = new PrismaClient({ log: ["query", "error", "warn"] });
}

export default prisma;

