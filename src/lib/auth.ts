import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { BrevoClient } from "@getbrevo/brevo";

const adapter = new PrismaPg({ connectionString: import.meta.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const brevo = new BrevoClient({ apiKey: import.meta.env.BREVO_API_KEY });

export const auth = betterAuth({
    baseURL: import.meta.env.BETTER_AUTH_URL,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            await brevo.transactionalEmails.sendTransacEmail({
                templateId: 7,
                to: [{ email: user.email, name: user.name }],
                params: { reset_link: url },
            });
        },
    },
    plugins: [
        admin(),
    ],
});