import type { PrismaClient } from "@/generated/prisma/client";

export function sanitizeCustomer(body: any) {
  return {
    name: body.name?.trim() || "",
    surname: body.surname?.trim() || "",
    phone: body.phone?.trim() || "",
    phone2: body.phone2?.trim() || null,
    email: body.email?.trim() || null,
    fiscalCode: body.fiscalCode?.trim() || null,
    birthDate: body.birthDate ? new Date(body.birthDate) : null,
    address: body.address?.trim() || null,
    notes: body.notes?.trim() || null,
  };
}

export async function validatePhone(prisma: PrismaClient, phone: string, excludeId?: string) {
  if (!phone) {
    return "Il telefono è obbligatorio";
  }
  const where: any = { phone };
  if (excludeId) where.id = { not: excludeId };
  const duplicate = await prisma.customer.findFirst({ where });
  if (duplicate) {
    return "Esiste già un cliente con questo numero di telefono";
  }
  return null;
}
