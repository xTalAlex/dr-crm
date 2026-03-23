import type { APIRoute } from "astro";
import { getDb } from "@/lib/db";
import { getSupabase, BUCKET } from "@/lib/supabase";
import { uploadFiles, FileSizeError } from "@/lib/file-upload";

export const prerender = false;

/** POST /admin/api/customers/:id/files/groups/:groupId — add files to an existing group */
export const POST: APIRoute = async ({ params, request }) => {
  try {
    const prisma = getDb();
    const supabase = getSupabase();
    const customerId = params.id!;
    const groupId = params.groupId!;

    const group = await prisma.fileGroup.findUnique({ where: { id: groupId } });
    if (!group || group.customerId !== customerId) {
      return Response.json({ error: "Gruppo non trovato" }, { status: 404 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return Response.json({ error: "Nessun file selezionato" }, { status: 400 });
    }

    const created = await uploadFiles(prisma, supabase, customerId, groupId, files);

    if (created.length === 0) {
      return Response.json({ error: "Upload fallito per tutti i file" }, { status: 500 });
    }

    return Response.json({ files: created }, { status: 201 });
  } catch (err: any) {
    if (err instanceof FileSizeError) {
      return Response.json({ error: err.message }, { status: 413 });
    }
    return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
  }
};

/** DELETE /admin/api/customers/:id/files/groups/:groupId — delete an entire group */
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const prisma = getDb();
    const supabase = getSupabase();
    const groupId = params.groupId!;

    const group = await prisma.fileGroup.findUnique({
      where: { id: groupId },
      include: { files: true },
    });
    if (!group) {
      return Response.json({ error: "Gruppo non trovato" }, { status: 404 });
    }

    // Delete files from Supabase
    const paths = group.files.map((f) => f.storagePath);
    if (paths.length > 0) {
      await supabase.storage.from(BUCKET).remove(paths);
    }

    // Cascade deletes files + magic links
    await prisma.fileGroup.delete({ where: { id: groupId } });

    return Response.json({ ok: true });
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
  }
};

/** PUT /admin/api/customers/:id/files/groups/:groupId — update group label */
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const prisma = getDb();
    const groupId = params.groupId!;
    const body = await request.json();

    const group = await prisma.fileGroup.update({
      where: { id: groupId },
      data: { label: body.label?.trim() || "" },
    });

    return Response.json(group);
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
  }
};
