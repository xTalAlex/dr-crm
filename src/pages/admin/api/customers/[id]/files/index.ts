import type { APIRoute } from "astro";
import { getDb } from "@/lib/db";

export const prerender = false;

/** GET /admin/api/customers/:id/files — list groups + files for a customer */
export const GET: APIRoute = async ({ params }) => {
  try {
    const prisma = getDb();
    const customerId = params.id!;

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return Response.json({ error: "Cliente non trovato" }, { status: 404 });
    }

    const groups = await prisma.fileGroup.findMany({
      where: { customerId },
      include: {
        files: { orderBy: { createdAt: "asc" } },
        magicLink: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ customer, groups });
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
  }
};
