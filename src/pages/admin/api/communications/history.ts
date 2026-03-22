import type { APIRoute } from "astro";
import { getDb } from "@/lib/db";

export const prerender = false;

/** GET /admin/api/communications/history — campaigns with logs grouped by send date */
export const GET: APIRoute = async () => {
  try {
    const prisma = getDb();

    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        logs: {
          orderBy: { sentAt: "desc" },
          include: {
            customer: {
              select: { id: true, name: true, surname: true, phone: true },
            },
          },
        },
      },
    });

    // Flatten into entries grouped by campaign + date (YYYY-MM-DD)
    const entries: any[] = [];

    for (const camp of campaigns) {
      const byDate = new Map<string, typeof camp.logs>();
      for (const log of camp.logs) {
        const dateKey = new Date(log.sentAt).toISOString().slice(0, 10);
        if (!byDate.has(dateKey)) byDate.set(dateKey, []);
        byDate.get(dateKey)!.push(log);
      }

      // Sort dates descending
      const sortedDates = [...byDate.keys()].sort((a, b) => b.localeCompare(a));

      for (const dateKey of sortedDates) {
        const logs = byDate.get(dateKey)!;
        entries.push({
          id: `${camp.id}__${dateKey}`,
          campaignId: camp.id,
          name: camp.name,
          channel: camp.channel,
          message: camp.message,
          date: dateKey,
          sentAt: logs[0].sentAt,
          count: logs.length,
          logs,
        });
      }
    }

    return Response.json({ entries });
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
  }
};
