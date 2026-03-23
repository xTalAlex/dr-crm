import type { APIRoute } from "astro";
import { getDb } from "@/lib/db";
import { getSupabase, BUCKET } from "@/lib/supabase";
import { sanitizeCustomer, validatePhone } from "@/lib/customer";

export const prerender = false;

export const PUT: APIRoute = async ({ params, request }) => {
    try {
        const prisma = getDb();
        const data = sanitizeCustomer(await request.json());

        const phoneError = await validatePhone(prisma, data.phone, params.id);
        if (phoneError) {
            const status = phoneError.includes("obbligatorio") ? 400 : 409;
            return Response.json({ error: phoneError }, { status });
        }

        const existing = await prisma.customer.findUnique({ where: { id: params.id } });
        if (!existing) {
            return Response.json({ error: "Cliente non trovato" }, { status: 404 });
        }

        const customer = await prisma.customer.update({
            where: { id: params.id },
            data,
        });

        return Response.json(customer);
    } catch (err: any) {
        return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
    }
};

export const DELETE: APIRoute = async ({ params }) => {
    try {
        const prisma = getDb();
        const supabase = getSupabase();
        const existing = await prisma.customer.findUnique({ where: { id: params.id } });
        if (!existing) {
            return Response.json({ error: "Cliente non trovato" }, { status: 404 });
        }

        // Remove all files from Supabase storage before DB cascade
        const groups = await prisma.fileGroup.findMany({
            where: { customerId: params.id },
            include: { files: true },
        });
        const paths = groups.flatMap((g) => g.files.map((f) => f.storagePath));
        if (paths.length > 0) {
            await supabase.storage.from(BUCKET).remove(paths);
        }

        await prisma.customer.delete({ where: { id: params.id } });

        return Response.json({ ok: true });
    } catch (err: any) {
        return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
    }
};
