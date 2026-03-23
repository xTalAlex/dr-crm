import { apiHandler, ApiError } from "@/lib/api";
import { BUCKET } from "@/lib/supabase";

export const prerender = false;

export const GET = apiHandler(async ({ params, redirect }, { prisma, supabase }) => {
  const fileId = params.fileId!;

  const entry = await prisma.fileEntry.findUnique({ where: { id: fileId } });
  if (!entry) throw new ApiError(404, "File non trovato");

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(entry.storagePath, 3600);

  if (error || !data?.signedUrl) {
    throw new ApiError(500, "Impossibile generare URL");
  }

  return redirect(data.signedUrl, 302);
});

export const DELETE = apiHandler(async ({ params }, { prisma, supabase }) => {
  const fileId = params.fileId!;

  const entry = await prisma.fileEntry.findUnique({ where: { id: fileId } });
  if (!entry) throw new ApiError(404, "File non trovato");

  await supabase.storage.from(BUCKET).remove([entry.storagePath]);
  await prisma.fileEntry.delete({ where: { id: fileId } });

  return Response.json({ ok: true });
});
