import { apiHandler, ApiError } from "@/lib/api";
import { sanitizeCustomer, validateCustomer } from "@/lib/customer";
import { scopes } from "@/lib/search";

export const prerender = false;

export const GET = apiHandler(async ({ url }, { prisma }) => {
    const search = url.searchParams.get("q") ?? "";
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? Math.min(5000, Math.max(1, Number(limitParam))) : undefined;
    const skip = limit ? (page - 1) * limit : 0;
    const letter = url.searchParams.get("letter") ?? "";

    const where = scopes.customer(search, letter || undefined);

    const [customers, total, letterRows] = await Promise.all([
        prisma.customer.findMany({
            where,
            orderBy: [{ surname: "asc" }, { name: "asc" }],
            skip,
            take: limit,
            include: { tags: { include: { tag: true } } },
        }),
        prisma.customer.count({ where }),
        prisma.$queryRaw`SELECT UPPER(LEFT(surname, 1)) AS letter, COUNT(*)::int AS count FROM customer WHERE surname != '' GROUP BY letter ORDER BY letter` as Promise<{ letter: string; count: number }[]>,
    ]);

    const letterCounts: Record<string, number> = {};
    for (const row of letterRows) {
        letterCounts[row.letter] = row.count;
    }

    return Response.json({ customers, total, page, limit, letterCounts });
});

export const POST = apiHandler(async ({ request }, { prisma }) => {
    const body = await request.json();
    const data = sanitizeCustomer(body);
    const tagIds: string[] = body.tagIds ?? [];

    const error = await validateCustomer(prisma, data);
    if (error) throw new ApiError(error.status, error.message);

    const customer = await prisma.customer.create({
        data: {
            ...data,
            ...(tagIds.length > 0 && {
                tags: { create: tagIds.map((tagId: string) => ({ tagId })) },
            }),
        },
        include: { tags: { include: { tag: true } } },
    });
    return Response.json(customer, { status: 201 });
});
