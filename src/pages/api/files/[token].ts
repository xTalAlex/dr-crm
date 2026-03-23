import type { APIRoute } from "astro";
import { getDb } from "@/lib/db";
import { getSupabase, BUCKET } from "@/lib/supabase";

export const prerender = false;

function validate(pin: string, magicLink: { expiresAt: Date; pin: string } | null): { status: number; error: string } | null {
  const checks: [boolean, number, string][] = [
    [!pin, 400, "Inserisci il codice PIN"],
    [!!pin && !magicLink, 404, "Link non valido"],
    [!!magicLink && magicLink.expiresAt < new Date(), 410, "Link scaduto"],
    [!!magicLink && magicLink.pin !== pin, 403, "Codice PIN errato"],
  ];
  const failed = checks.find(([condition]) => condition);
  return failed ? { status: failed[1], error: failed[2] } : null;
}

export const POST: APIRoute = async ({ params, request }) => {
  const prisma = getDb();
  const supabase = getSupabase();
  const token = params.token!;

  const body = await request.json().catch(() => ({}));
  const pin = String(body.pin ?? "").trim();

  const magicLink = pin
    ? await prisma.magicLink.findUnique({
        where: { token },
        include: { group: { include: { files: true } } },
      })
    : null;

  const error = validate(pin, magicLink);

  const files = !error && magicLink
    ? await Promise.all(
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
        })
      )
    : [];

  const payload = error
    ? { error: error.error }
    : { label: magicLink!.group.label, expiresAt: magicLink!.expiresAt, files };

  return Response.json(payload, { status: error?.status ?? 200 });
};
