import { apiHandler } from "@/lib/api";
import { scopes } from "@/lib/search";

export const prerender = false;

export const GET = apiHandler(async ({ url }, { prisma }) => {
  const search = url.searchParams.get("search")?.trim() ?? "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const perPage = 20;

  const where = scopes.fileGroup(search);

  const [groups, total] = await Promise.all([
    prisma.fileGroup.findMany({
      where,
      include: {
        files: { orderBy: { createdAt: "asc" } },
        magicLink: true,
        customer: { select: { id: true, name: true, surname: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.fileGroup.count({ where }),
  ]);

  return Response.json({ groups, total, page, perPage });
});
