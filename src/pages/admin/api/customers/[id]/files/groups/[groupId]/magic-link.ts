import { apiHandler, ApiError } from "@/lib/api";
import { randomBytes } from "node:crypto";

export const prerender = false;

export const POST = apiHandler(async ({ params, request }, { prisma }) => {
  const groupId = params.groupId!;

  const body = await request.json().catch(() => ({}));
  const expiresInHours = Math.min(720, Math.max(1, Number(body.expiresInHours) || 72));

  const group = await prisma.fileGroup.findUnique({
    where: { id: groupId },
    include: { files: true },
  });
  if (!group) throw new ApiError(404, "Gruppo non trovato");
  if (group.files.length === 0) throw new ApiError(400, "Il gruppo non ha file");

  await prisma.magicLink.deleteMany({ where: { groupId } });

  const token = randomBytes(32).toString("hex");
  const pin = String(Math.floor(1000 + Math.random() * 9000));
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  const magicLink = await prisma.magicLink.create({
    data: { token, pin, groupId, expiresAt },
  });

  return Response.json({ magicLink }, { status: 201 });
});
