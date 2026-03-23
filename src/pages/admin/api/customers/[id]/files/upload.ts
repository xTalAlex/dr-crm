import type { APIRoute } from "astro";
import { getDb } from "@/lib/db";
import { getSupabase, BUCKET } from "@/lib/supabase";
import { randomBytes } from "node:crypto";

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

    // Create group
    const group = await prisma.fileGroup.create({
      data: { customerId, label },
    });

    const created: any[] = [];

    for (const file of files) {
      const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
      const safeName = `${randomBytes(8).toString("hex")}${ext}`;
      const storagePath = `${customerId}/${group.id}/${safeName}`;

      const buffer = await file.arrayBuffer();
      const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

      if (error) {
        console.error("Supabase upload error:", error);
        continue;
      }

      const entry = await prisma.fileEntry.create({
        data: {
          fileName: file.name,
          storagePath,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          groupId: group.id,
        },
      });
      created.push(entry);
    }

    if (created.length === 0) {
      // Cleanup empty group
      await prisma.fileGroup.delete({ where: { id: group.id } });
      return Response.json({ error: `Upload fallito per tutti i file: ${lastError}` }, { status: 500 });
    }

    return Response.json({ group, files: created }, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
  }
};
