import { apiHandler, ApiError } from "@/lib/api";
import { BUCKET } from "@/lib/supabase";

export const prerender = false;

/**
 * TODO: Aggiungere rate limiting sui tentativi PIN.
 * Aggiungere un campo `failedAttempts` alla tabella MagicLink e incrementarlo
 * ad ogni PIN errato. Raggiunta la soglia (es. 5), impostare `expiresAt` a now()
 * per invalidare il link e restituire un errore "Link disabilitato per troppi tentativi".
 */
export const POST = apiHandler(async ({ params, request }, { prisma, supabase }) => {
  const token = params.token!;
  const body = await request.json().catch(() => ({}));
  const pin = String(body.pin ?? "").trim();

  if (!pin) throw new ApiError(400, "Inserisci il codice PIN");

  const magicLink = await prisma.magicLink.findUnique({
    where: { token },
    include: { group: { include: { files: true } } },
  });

  if (!magicLink) throw new ApiError(404, "Link non valido");
  if (magicLink.expiresAt < new Date()) throw new ApiError(410, "Link scaduto");
  if (magicLink.pin !== pin) throw new ApiError(403, "Codice PIN errato");

  const files = await Promise.all(
    magicLink.group.files.map(async (f) => {
      const { data } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(f.storagePath, 3600);
      return {
        fileName: f.fileName,
        mimeType: f.mimeType,
        size: f.size,
        url: data?.signedUrl ?? null,
      };
    }),
  );

  return Response.json({
    label: magicLink.group.label,
    expiresAt: magicLink.expiresAt,
    files,
  });
});
