import type { APIRoute } from "astro";
import { getDb } from "@/lib/db";
import { getSupabase } from "@/lib/supabase";
import { uploadFiles, FileSizeError } from "@/lib/file-upload";

export const prerender = false;

/** POST /admin/api/customers/:id/files/upload — upload files and create a group */
export const POST: APIRoute = async ({ params, request }) => {
  try {
    const prisma = getDb();
    const supabase = getSupabase();
    const customerId = params.id!;

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return Response.json({ error: "Cliente non trovato" }, { status: 404 });
    }

    const formData = await request.formData();
    const label = (formData.get("label") as string)?.trim() || "";
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return Response.json({ error: "Nessun file selezionato" }, { status: 400 });
    }

    const group = await prisma.fileGroup.create({
      data: { customerId, label },
    });

    const created = await uploadFiles(prisma, supabase, customerId, group.id, files);

    if (created.length === 0) {
      await prisma.fileGroup.delete({ where: { id: group.id } });
      return Response.json({ error: "Upload fallito per tutti i file" }, { status: 500 });
    }

    return Response.json({ group, files: created }, { status: 201 });
  } catch (err: any) {
    if (err instanceof FileSizeError) {
      return Response.json({ error: err.message }, { status: 413 });
    }
    return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
  }
};
