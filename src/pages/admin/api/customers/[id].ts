import { apiHandler, ApiError } from "@/lib/api";
import { BUCKET } from "@/lib/supabase";
import { sanitizeCustomer, validateCustomer } from "@/lib/customer";
import { logError } from "@/lib/log";

export const prerender = false;

export const PUT = apiHandler(async ({ params, request }, { prisma }) => {
    const body = await request.json();
    const data = sanitizeCustomer(body);
    const tagIds: string[] | undefined = body.tagIds;

    const error = await validateCustomer(prisma, data, params.id);
    if (error) throw new ApiError(error.status, error.message);

    const existing = await prisma.customer.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError(404, "Paziente non trovato");

    const customer = await prisma.customer.update({
        where: { id: params.id },
        data: {
            ...data,
            ...(tagIds !== undefined && {
                tags: {
                    deleteMany: {},
                    create: tagIds.map((tagId: string) => ({ tagId })),
                },
            }),
        },
        include: { tags: { include: { tag: true } } },
    });

    return Response.json(customer);
});

export const DELETE = apiHandler(async ({ params }, { prisma, supabase }) => {
    const existing = await prisma.customer.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError(404, "Paziente non trovato");

    const groups = await prisma.fileGroup.findMany({
        where: { customerId: params.id },
        include: { files: true },
    });
    const paths = groups.flatMap((g) => g.files.map((f) => f.storagePath));

    await prisma.customer.delete({ where: { id: params.id } });

    if (paths.length > 0) {
        await supabase.storage.from(BUCKET).remove(paths).catch((err) => {
            logError(`/admin/api/customers/${params.id}`, err);
        });
    }

    return Response.json({ ok: true });
});
