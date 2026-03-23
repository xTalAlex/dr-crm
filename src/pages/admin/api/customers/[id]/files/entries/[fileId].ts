import type { APIRoute } from "astro";
import { getDb } from "@/lib/db";
import { getSupabase, BUCKET } from "@/lib/supabase";

export const prerender = false;

/** GET /admin/api/customers/:id/files/entries/:fileId — get a signed URL to view the file */
export const GET: APIRoute = async ({ params, redirect }) => {
  try {
    const prisma = getDb();
    const supabase = getSupabase();
    const fileId = params.fileId!;

    const entry = await prisma.fileEntry.findUnique({ where: { id: fileId } });
    if (!entry) {
      return Response.json({ error: "File non trovato" }, { status: 404 });
    }

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(entry.storagePath, 3600);

    if (error || !data?.signedUrl) {
      return Response.json({ error: "Impossibile generare URL" }, { status: 500 });
    }

    return redirect(data.signedUrl, 302);
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
  }
};

/** DELETE /admin/api/customers/:id/files/entries/:fileId — delete a single file */
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const prisma = getDb();
    const supabase = getSupabase();
    const fileId = params.fileId!;

    const entry = await prisma.fileEntry.findUnique({ where: { id: fileId } });
    if (!entry) {
      return Response.json({ error: "File non trovato" }, { status: 404 });
    }

    await supabase.storage.from(BUCKET).remove([entry.storagePath]);
    await prisma.fileEntry.delete({ where: { id: fileId } });

    return Response.json({ ok: true });
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
  }
};
