import { apiHandler, ApiError } from "@/lib/api";

export const prerender = false;

export const PUT = apiHandler(async ({ params, request }, { prisma }) => {
  const body = await request.json();
  const name = body.name?.trim();
  if (!name) throw new ApiError(400, "Il nome del tag è obbligatorio");

  const existing = await prisma.tag.findFirst({
    where: { name: { equals: name, mode: "insensitive" }, id: { not: params.id } },
  });
  if (existing) throw new ApiError(409, "Esiste già un tag con questo nome");

  const tag = await prisma.tag.update({
    where: { id: params.id },
    data: { name, color: body.color?.trim() || null },
  });
  return Response.json(tag);
});

export const DELETE = apiHandler(async ({ params }, { prisma }) => {
  const tag = await prisma.tag.findUnique({ where: { id: params.id } });
  if (!tag) throw new ApiError(404, "Tag non trovato");

  await prisma.tag.delete({ where: { id: params.id } });
  return Response.json({ ok: true });
});
