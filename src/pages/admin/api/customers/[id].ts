import { apiHandler, ApiError } from "@/lib/api";
import { BUCKET } from "@/lib/supabase";
import { sanitizeCustomer, validatePhone } from "@/lib/customer";

export const prerender = false;

export const PUT = apiHandler(async ({ params, request }, { prisma }) => {
    const data = sanitizeCustomer(await request.json());

    const phoneError = await validatePhone(prisma, data.phone, params.id);
    if (phoneError) {
        const status = phoneError.includes("obbligatorio") ? 400 : 409;
        throw new ApiError(status, phoneError);
    }

    const existing = await prisma.customer.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError(404, "Cliente non trovato");

    const customer = await prisma.customer.update({
        where: { id: params.id },
        data,
    });

    return Response.json(customer);
});

export const DELETE = apiHandler(async ({ params }, { prisma, supabase }) => {
    const existing = await prisma.customer.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError(404, "Cliente non trovato");

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
});
