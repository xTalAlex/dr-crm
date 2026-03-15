import type { APIRoute } from "astro";
import { getDb } from "@/lib/db";

export const prerender = false;

/** GET /admin/api/communications/campaigns — list campaigns with recipient counts */
export const GET: APIRoute = async ({ url }) => {
  try {
    const prisma = getDb();
    const channel = url.searchParams.get("channel") ?? "";

    const where: any = {};
    if (channel) where.channel = channel;

    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { logs: true } },
      },
    });

    return Response.json({ campaigns });
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
  }
};

/** POST /admin/api/communications/campaigns — create a new campaign */
export const POST: APIRoute = async ({ request }) => {
  try {
    const prisma = getDb();
    const body = await request.json();
    const { name, channel, message } = body as {
      name: string;
      channel: string;
      message: string;
    };

    if (!name?.trim()) {
      return Response.json({ error: "Il nome della campagna è obbligatorio" }, { status: 400 });
    }
    if (!channel || !["sms", "email"].includes(channel)) {
      return Response.json({ error: "Canale non valido" }, { status: 400 });
    }
    if (!message?.trim()) {
      return Response.json({ error: "Il messaggio è obbligatorio" }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: { name: name.trim(), channel, message: message.trim() },
    });

    return Response.json({ campaign }, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
  }
};
