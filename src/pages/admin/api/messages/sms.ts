import type { APIRoute } from "astro";

export const prerender = false;

/** POST /admin/api/messages/sms — send an SMS via Brevo */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { phone, text } = body;

    if (!phone?.trim() || !text?.trim()) {
      return Response.json({ error: "Telefono e messaggio sono obbligatori" }, { status: 400 });
    }

    // TODO: integrate with Brevo transactional SMS API
    // const brevo = new TransactionalSMSApi();
    // await brevo.sendTransacSms({ sender: "...", recipient: phone, content: text });

    console.log(`[SMS] To: ${phone} — ${text.slice(0, 80)}...`);

    return Response.json({ ok: true, message: "SMS accodato" });
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
  }
};
