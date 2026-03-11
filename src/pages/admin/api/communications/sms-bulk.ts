import type { APIRoute } from "astro";

export const prerender = false;

/** POST /admin/api/communications/sms-bulk — send SMS to multiple customers */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { recipients, text } = body as {
      recipients: { name: string; phone: string }[];
      text: string;
    };

    if (!text?.trim()) {
      return Response.json({ error: "Il messaggio è obbligatorio" }, { status: 400 });
    }

    if (!recipients || recipients.length === 0) {
      return Response.json({ error: "Seleziona almeno un destinatario" }, { status: 400 });
    }

    // TODO: integrate with Brevo transactional SMS API
    let sent = 0;
    for (const r of recipients) {
      if (!r.phone?.trim()) continue;
      console.log(`[SMS-BULK] To: ${r.phone} (${r.name}) — ${text.slice(0, 80)}...`);
      sent++;
    }

    return Response.json({ ok: true, sent, total: recipients.length });
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
  }
};
