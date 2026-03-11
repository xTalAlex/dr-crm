import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

let prisma: PrismaClient | null = null;

export function getDb(): PrismaClient {
    if (!prisma) {
        const url = import.meta.env.DATABASE_URL;
        if (!url) throw new Error("Missing DATABASE_URL");
        const adapter = new PrismaPg({ connectionString: url });
        prisma = new PrismaClient({ adapter });
    }
    return prisma;
}
