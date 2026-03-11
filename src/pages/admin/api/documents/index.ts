import type { APIRoute } from "astro";
import { getDb } from "@/lib/db";

export const prerender = false;

/** GET /admin/api/documents — list all file groups across all customers */
export const GET: APIRoute = async ({ url }) => {
  try {
    const prisma = getDb();

    const search = url.searchParams.get("search")?.trim() ?? "";
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
    const perPage = 20;

    const where: any = {};

    if (search) {
      where.OR = [
        { label: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
        { customer: { surname: { contains: search, mode: "insensitive" } } },
      ];
    }

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
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
  }
};
