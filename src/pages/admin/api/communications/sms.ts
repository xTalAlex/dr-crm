import type { APIRoute } from "astro";
import { BrevoClient } from "@getbrevo/brevo";
import content from "@/data/content.json";

export const prerender = false;

const brevo = new BrevoClient({ apiKey: import.meta.env.BREVO_API_KEY });

/** Normalize a phone number to E.164 international format (default country: +39 Italy) */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("00")) return "+" + digits.slice(2);
  return "+39" + digits;
}

/** POST /admin/api/communications/sms — send an SMS via Brevo */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { phone, text } = body;

    if (!phone?.trim() || !text?.trim()) {
      return Response.json({ error: "Telefono e messaggio sono obbligatori" }, { status: 400 });
    }

    await brevo.transactionalSms.sendTransacSms({
      sender: content.contacts.smsSender,
      recipient: normalizePhone(phone),
      content: text,
      type: "transactional",
    } as any);

    return Response.json({ ok: true, message: "SMS inviato" });
  } catch (err: any) {
    console.error("[SMS] Error:", err);
    return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
  }
};
