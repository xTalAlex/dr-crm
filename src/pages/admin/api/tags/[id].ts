import { apiHandler, ApiError } from "@/lib/api";
import { sanitizeTag, validateTag } from "@/lib/tag";

export const prerender = false;

export const PUT = apiHandler(async ({ params, request }, { prisma }) => {
  const data = sanitizeTag(await request.json());
  const error = await validateTag(prisma, data, params.id);
  if (error) throw new ApiError(error.status, error.message);

  const tag = await prisma.tag.update({
    where: { id: params.id },
    data,
  });
  return Response.json(tag);
});

export const DELETE = apiHandler(async ({ params }, { prisma }) => {
  const tag = await prisma.tag.findUnique({ where: { id: params.id } });
  if (!tag) throw new ApiError(404, "Tag non trovato");

  await prisma.tag.delete({ where: { id: params.id } });
  return Response.json({ ok: true });
});
