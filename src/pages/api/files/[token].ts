import type { APIRoute } from "astro";
import { getDb } from "@/lib/db";
import { getSupabase, BUCKET } from "@/lib/supabase";

export const prerender = false;

/** POST /api/files/:token — public endpoint: resolve magic link with PIN → signed URLs */
export const POST: APIRoute = async ({ params, request }) => {
  try {
    const prisma = getDb();
    const supabase = getSupabase();
    const token = params.token!;

    const body = await request.json().catch(() => ({}));
    const pin = String(body.pin ?? "").trim();

    if (!pin) {
      return Response.json({ error: "Inserisci il codice PIN" }, { status: 400 });
    }

    const magicLink = await prisma.magicLink.findUnique({
      where: { token },
      include: {
        group: {
          include: { files: true },
        },
      },
    });

    if (!magicLink) {
      return Response.json({ error: "Link non valido" }, { status: 404 });
    }
    if (magicLink.expiresAt < new Date()) {
      return Response.json({ error: "Link scaduto" }, { status: 410 });
    }
    if (magicLink.pin !== pin) {
      return Response.json({ error: "Codice PIN errato" }, { status: 403 });
    }

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
      })
    );

    return Response.json({
      label: magicLink.group.label,
      expiresAt: magicLink.expiresAt,
      files,
    });
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
  }
};
