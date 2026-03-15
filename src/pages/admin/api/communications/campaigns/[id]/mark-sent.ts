import type { APIRoute } from "astro";
import { getDb } from "@/lib/db";

export const prerender = false;

/** POST /admin/api/communications/campaigns/:id/mark-sent — mark customers as already sent */
export const POST: APIRoute = async ({ params, request }) => {
  try {
    const prisma = getDb();
    const { id } = params;
    if (!id) {
      return Response.json({ error: "ID mancante" }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) {
      return Response.json({ error: "Campagna non trovata" }, { status: 404 });
    }

    const body = await request.json();
    const { customerIds } = body as { customerIds: string[] };

    if (!customerIds || customerIds.length === 0) {
      return Response.json({ error: "Seleziona almeno un cliente" }, { status: 400 });
    }

    const result = await prisma.communicationLog.createMany({
      data: customerIds.map((customerId) => ({ campaignId: id, customerId })),
      skipDuplicates: true,
    });

    return Response.json({ ok: true, marked: result.count });
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
  }
};
