import type { PrismaClient } from "@/generated/prisma/client";

export const TAG_NAME_MAX_LENGTH = 20;

export function sanitizeTag(body: any) {
  return {
    name: body.name?.trim() || "",
    color: body.color?.trim() || null,
  };
}

export async function validateTag(
  prisma: PrismaClient,
  data: ReturnType<typeof sanitizeTag>,
  excludeId?: string,
): Promise<{ status: number; message: string } | null> {
  if (!data.name) {
    return { status: 400, message: "Il nome del tag è obbligatorio" };
  }
  if (data.name.length > TAG_NAME_MAX_LENGTH) {
    return { status: 400, message: `Il nome del tag non può superare ${TAG_NAME_MAX_LENGTH} caratteri` };
  }
  const where: any = { name: { equals: data.name, mode: "insensitive" } };
  if (excludeId) where.id = { not: excludeId };
  const existing = await prisma.tag.findFirst({ where });
  if (existing) {
    return { status: 409, message: "Esiste già un tag con questo nome" };
  }
  return null;
}
