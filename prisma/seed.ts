import "dotenv/config";
import { auth } from "../src/lib/auth";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
if (!ADMIN_EMAIL) {
  console.error("ADMIN_EMAIL env variable is required");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    console.log("Admin already exists:", existing.email);
    return;
  }

  // Create user with a random temporary password
  const { user } = await auth.api.signUpEmail({
    body: { email: ADMIN_EMAIL, password: crypto.randomUUID(), name: "Admin" },
  });

  // Set role directly via Prisma (no admin session needed)
  await prisma.user.update({
    where: { id: user.id },
    data: { role: "admin" },
  });

  console.log("Admin created:", user.email);
  console.log("Use 'Reset password' on the login page to set your password.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err.message ?? err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
