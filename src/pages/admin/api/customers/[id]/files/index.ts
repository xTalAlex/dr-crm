import { apiHandler, ApiError } from "@/lib/api";

export const prerender = false;

export const GET = apiHandler(async ({ params }, { prisma }) => {
  const customerId = params.id!;

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw new ApiError(404, "Cliente non trovato");

  const groups = await prisma.fileGroup.findMany({
    where: { customerId },
    include: {
      files: { orderBy: { createdAt: "asc" } },
      magicLink: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ customer, groups });
});
