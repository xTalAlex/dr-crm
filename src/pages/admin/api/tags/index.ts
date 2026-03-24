import { apiHandler, ApiError } from "@/lib/api";
import { sanitizeTag, validateTag } from "@/lib/tag";

export const prerender = false;

export const GET = apiHandler(async (_ctx, { prisma }) => {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { customers: true } } },
  });
  return Response.json(tags);
});

export const POST = apiHandler(async ({ request }, { prisma }) => {
  const data = sanitizeTag(await request.json());
  const error = await validateTag(prisma, data);
  if (error) throw new ApiError(error.status, error.message);

  const tag = await prisma.tag.create({ data });
  return Response.json(tag, { status: 201 });
});
