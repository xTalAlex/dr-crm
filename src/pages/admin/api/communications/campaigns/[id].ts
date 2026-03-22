import type { APIRoute } from "astro";
import { getDb } from "@/lib/db";

export const prerender = false;

/** GET /admin/api/communications/campaigns/:id — campaign detail with recipient list */
export const GET: APIRoute = async ({ params, url }) => {
  try {
    const prisma = getDb();
    const { id } = params;
    if (!id) {
      return Response.json({ error: "ID mancante" }, { status: 400 });
    }

    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(5000, Math.max(1, Number(url.searchParams.get("limit")) || 50));
    const skip = (page - 1) * limit;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { _count: { select: { logs: true } } },
    });

    if (!campaign) {
      return Response.json({ error: "Campagna non trovata" }, { status: 404 });
    }

    const [logs, totalLogs] = await Promise.all([
      prisma.communicationLog.findMany({
        where: { campaignId: id },
        orderBy: { sentAt: "desc" },
        skip,
        take: limit,
        include: {
          customer: {
            select: { id: true, name: true, surname: true, phone: true, email: true },
          },
        },
      }),
      prisma.communicationLog.count({ where: { campaignId: id } }),
    ]);

    return Response.json({ campaign, logs, totalLogs, page, limit });
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
  }
};

/** PUT /admin/api/communications/campaigns/:id — update campaign */
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const prisma = getDb();
    const { id } = params;
    if (!id) {
      return Response.json({ error: "ID mancante" }, { status: 400 });
    }

    const body = await request.json();
    const { name, message } = body as { name?: string; message?: string };

    const data: Record<string, string> = {};
    if (name !== undefined) {
      if (!name.trim()) {
        return Response.json({ error: "Il nome non può essere vuoto" }, { status: 400 });
      }
      data.name = name.trim();
    }
    if (message !== undefined) {
      if (!message.trim()) {
        return Response.json({ error: "Il messaggio non può essere vuoto" }, { status: 400 });
      }
      data.message = message.trim();
    }

    if (Object.keys(data).length === 0) {
      return Response.json({ error: "Nessun campo da aggiornare" }, { status: 400 });
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data,
    });

    return Response.json({ campaign });
  } catch (err: any) {
    if (err.code === "P2025") {
      return Response.json({ error: "Campagna non trovata" }, { status: 404 });
    }
    return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
  }
};

/** GET sent customer IDs for a campaign — used by frontend to mark already-sent */
