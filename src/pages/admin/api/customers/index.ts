import type { APIRoute } from "astro";
import { getDb } from "@/lib/db";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
    try {
        const prisma = getDb();
        const search = url.searchParams.get("q") ?? "";
        const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
        const limit = Math.min(5000, Math.max(1, Number(url.searchParams.get("limit")) || 25));
        const skip = (page - 1) * limit;
        const letter = url.searchParams.get("letter") ?? "";

        const conditions: any[] = [];

        if (search) {
            conditions.push({
                OR: [
                    { name: { contains: search, mode: "insensitive" as const } },
                    { surname: { contains: search, mode: "insensitive" as const } },
                    { phone: { contains: search } },
                    { email: { contains: search, mode: "insensitive" as const } },
                    { fiscalCode: { contains: search, mode: "insensitive" as const } },
                ],
            });
        }

        if (letter) {
            conditions.push({
                surname: { startsWith: letter, mode: "insensitive" as const },
            });
        }

        const where = conditions.length > 0 ? { AND: conditions } : {};

        const [customers, total, letterRows] = await Promise.all([
            prisma.customer.findMany({
                where,
                orderBy: [{ surname: "asc" }, { name: "asc" }],
                skip,
                take: limit,
            }),
            prisma.customer.count({ where }),
            prisma.$queryRaw`SELECT UPPER(LEFT(surname, 1)) AS letter, COUNT(*)::int AS count FROM customer WHERE surname != '' GROUP BY letter ORDER BY letter` as Promise<{ letter: string; count: number }[]>,
        ]);

        const letterCounts: Record<string, number> = {};
        for (const row of letterRows) {
            letterCounts[row.letter] = row.count;
        }

        return Response.json({ customers, total, page, limit, letterCounts });
    } catch (err: any) {
        return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const prisma = getDb();
        const body = await request.json();

        const { name, surname, phone, phone2, email, fiscalCode, birthDate, address, notes } = body;

        if (!phone?.trim()) {
            return Response.json({ error: "Il telefono è obbligatorio" }, { status: 400 });
        }

        const customer = await prisma.customer.create({
            data: {
                name: name?.trim() || "",
                surname: surname?.trim() || "",
                phone: phone.trim(),
                phone2: phone2?.trim() || null,
                email: email?.trim() || null,
                fiscalCode: fiscalCode?.trim() || null,
                birthDate: birthDate ? new Date(birthDate) : null,
                address: address?.trim() || null,
                notes: notes?.trim() || null,
            },
        });

        return Response.json(customer, { status: 201 });
    } catch (err: any) {
        return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
    }
};
