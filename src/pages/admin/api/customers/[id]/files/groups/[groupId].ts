import { apiHandler, ApiError } from "@/lib/api";
import { BUCKET } from "@/lib/supabase";
import { uploadFiles } from "@/lib/file-upload";

export const prerender = false;

export const POST = apiHandler(async ({ params, request }, { prisma, supabase }) => {
  const customerId = params.id!;
  const groupId = params.groupId!;

  const group = await prisma.fileGroup.findUnique({ where: { id: groupId } });
  if (!group || group.customerId !== customerId) {
    throw new ApiError(404, "Gruppo non trovato");
  }

  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0) throw new ApiError(400, "Nessun file selezionato");

  const { created, failed } = await uploadFiles(prisma, supabase, customerId, groupId, files);

  if (created.length === 0) {
    throw new ApiError(500, "Upload fallito per tutti i file");
  }

  return Response.json({ files: created, failed }, { status: 201 });
});

export const DELETE = apiHandler(async ({ params }, { prisma, supabase }) => {
  const groupId = params.groupId!;

  const group = await prisma.fileGroup.findUnique({
    where: { id: groupId },
    include: { files: true },
  });
  if (!group) throw new ApiError(404, "Gruppo non trovato");

  const paths = group.files.map((f) => f.storagePath);
  if (paths.length > 0) {
    await supabase.storage.from(BUCKET).remove(paths);
  }

  await prisma.fileGroup.delete({ where: { id: groupId } });

  return Response.json({ ok: true });
});

export const PUT = apiHandler(async ({ params, request }, { prisma }) => {
  const groupId = params.groupId!;
  const body = await request.json();

  const group = await prisma.fileGroup.update({
    where: { id: groupId },
    data: { label: body.label?.trim() || "" },
  });

  return Response.json(group);
});
