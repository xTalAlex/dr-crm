import type { APIRoute } from "astro";
import { getDb } from "@/lib/db";

export const prerender = false;

/** GET /admin/api/communications/campaigns/:id/sent-ids — IDs of customers already sent */
export const GET: APIRoute = async ({ params }) => {
  try {
    const prisma = getDb();
    const { id } = params;
    if (!id) {
      return Response.json({ error: "ID mancante" }, { status: 400 });
    }

    const logs = await prisma.communicationLog.findMany({
      where: { campaignId: id },
      select: { customerId: true },
    });

    const sentIds = logs.map((l) => l.customerId);
    return Response.json({ sentIds });
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
  }
};
