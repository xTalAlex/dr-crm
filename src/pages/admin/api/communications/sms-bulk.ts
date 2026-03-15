import type { APIRoute } from "astro";
import { getDb } from "@/lib/db";
import { BrevoClient } from "@getbrevo/brevo";
import content from "@/data/content.json";

export const prerender = false;

const brevo = new BrevoClient({ apiKey: import.meta.env.BREVO_API_KEY });

/** POST /admin/api/communications/sms-bulk — send SMS to multiple customers */
export const POST: APIRoute = async ({ request }) => {
  try {
    const prisma = getDb();
    const body = await request.json();
    const { campaignId, recipients, text } = body as {
      campaignId?: string;
      recipients: { id: string; name: string; phone: string }[];
      text?: string;
    };

    if (!recipients || recipients.length === 0) {
      return Response.json({ error: "Seleziona almeno un destinatario" }, { status: 400 });
    }

    let messageText = text ?? "";

    // If campaign is provided, use its message and log sends
    if (campaignId) {
      const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
      if (!campaign) {
        return Response.json({ error: "Campagna non trovata" }, { status: 404 });
      }
      messageText = campaign.message;
    }

    if (!messageText.trim()) {
      return Response.json({ error: "Il messaggio è obbligatorio" }, { status: 400 });
    }

    // Send SMS via Brevo
    let sent = 0;
    const logsData: { campaignId: string; customerId: string }[] = [];

    for (const r of recipients) {
      if (!r.phone?.trim()) continue;
      try {
        await brevo.transactionalSms.sendTransacSms({
          sender: content.contacts.smsSender,
          recipient: r.phone,
          content: messageText,
          type: "transactional",
        } as any);
        if (campaignId) {
          logsData.push({ campaignId, customerId: r.id });
        }
        sent++;
      } catch (err) {
        console.error(`[SMS-BULK] Failed for ${r.phone}:`, err);
      }
    }

    // Persist communication logs (skipDuplicates avoids re-sending to same customer)
    if (logsData.length > 0) {
      await prisma.communicationLog.createMany({
        data: logsData,
        skipDuplicates: true,
      });
    }

    return Response.json({ ok: true, sent, total: recipients.length });
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
  }
};
