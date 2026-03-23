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

export async function validateCustomer(
  prisma: PrismaClient,
  data: ReturnType<typeof sanitizeCustomer>,
  excludeId?: string,
): Promise<{ status: number; message: string } | null> {
  if (!data.surname) {
    return { status: 400, message: "Il cognome è obbligatorio" };
  }
  if (!data.phone) {
    return { status: 400, message: "Il telefono è obbligatorio" };
  }
  const where: any = { phone: data.phone };
  if (excludeId) where.id = { not: excludeId };
  const duplicate = await prisma.customer.findFirst({ where });
  if (duplicate) {
    return { status: 409, message: "Esiste già un cliente con questo numero di telefono" };
  }
  return null;
}
