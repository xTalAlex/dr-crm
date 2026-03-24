import { apiHandler, ApiError } from "@/lib/api";

export const prerender = false;

export const GET = apiHandler(async (_ctx, { prisma }) => {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { customers: true } } },
  });
  return Response.json(tags);
});

export const POST = apiHandler(async ({ request }, { prisma }) => {
  const body = await request.json();
  const name = body.name?.trim();
  if (!name) throw new ApiError(400, "Il nome del tag è obbligatorio");

  const existing = await prisma.tag.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  if (existing) throw new ApiError(409, "Esiste già un tag con questo nome");

  const tag = await prisma.tag.create({
    data: { name, color: body.color?.trim() || null },
  });
  return Response.json(tag, { status: 201 });
});
