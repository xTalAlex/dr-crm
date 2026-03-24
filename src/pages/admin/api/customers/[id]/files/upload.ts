import { apiHandler, ApiError } from "@/lib/api";
import { uploadFiles } from "@/lib/file-upload";

export const prerender = false;

export const POST = apiHandler(async ({ params, request }, { prisma, supabase }) => {
  const customerId = params.id!;

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw new ApiError(404, "Paziente non trovato");

  const formData = await request.formData();
  const label = (formData.get("label") as string)?.trim() || "";
  const files = formData.getAll("files") as File[];

  if (files.length === 0) throw new ApiError(400, "Nessun file selezionato");

  const group = await prisma.fileGroup.create({
    data: { customerId, label },
  });

  const { created, failed } = await uploadFiles(prisma, supabase, customerId, group.id, files);

  if (created.length === 0) {
    await prisma.fileGroup.delete({ where: { id: group.id } });
    throw new ApiError(500, "Upload fallito per tutti i file");
  }

  return Response.json({ group, files: created, failed }, { status: 201 });
});
