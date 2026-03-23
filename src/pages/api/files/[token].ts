import { apiHandler, ApiError } from "@/lib/api";
import { BUCKET } from "@/lib/supabase";

export const prerender = false;

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
