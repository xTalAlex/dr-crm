import type { APIRoute } from "astro";
import { getDb } from "@/lib/db";
import { getSupabase, BUCKET } from "@/lib/supabase";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
    try {
        const prisma = getDb();
        const customer = await prisma.customer.findUnique({ where: { id: params.id } });

        if (!customer) {
            return Response.json({ error: "Cliente non trovato" }, { status: 404 });
        }

        return Response.json(customer);
    } catch (err: any) {
        return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
    }
};

export const PUT: APIRoute = async ({ params, request }) => {
    try {
        const prisma = getDb();
        const body = await request.json();
        const { name, surname, phone, phone2, email, fiscalCode, birthDate, address, notes } = body;

        if (!phone?.trim()) {
            return Response.json({ error: "Il telefono è obbligatorio" }, { status: 400 });
        }

        const duplicate = await prisma.customer.findFirst({ where: { phone: phone.trim(), id: { not: params.id } } });
        if (duplicate) {
            return Response.json({ error: "Esiste già un cliente con questo numero di telefono" }, { status: 409 });
        }

        const existing = await prisma.customer.findUnique({ where: { id: params.id } });
        if (!existing) {
            return Response.json({ error: "Cliente non trovato" }, { status: 404 });
        }

        const customer = await prisma.customer.update({
            where: { id: params.id },
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
