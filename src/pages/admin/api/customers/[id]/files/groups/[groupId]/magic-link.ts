import type { APIRoute } from "astro";
import { getDb } from "@/lib/db";
import { randomBytes } from "node:crypto";

export const prerender = false;

/** POST /admin/api/customers/:id/files/groups/:groupId/magic-link — generate a magic link */
export const POST: APIRoute = async ({ params, request }) => {
  try {
    const prisma = getDb();
    const groupId = params.groupId!;

    const body = await request.json().catch(() => ({}));
    const expiresInHours = Math.min(720, Math.max(1, Number(body.expiresInHours) || 72));

    const group = await prisma.fileGroup.findUnique({
      where: { id: groupId },
      include: { files: true },
    });
    if (!group) {
      return Response.json({ error: "Gruppo non trovato" }, { status: 404 });
    }
    if (group.files.length === 0) {
      return Response.json({ error: "Il gruppo non ha file" }, { status: 400 });
    }

    // Delete existing magic link for this group
    await prisma.magicLink.deleteMany({ where: { groupId } });

    const token = randomBytes(32).toString("hex");
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const magicLink = await prisma.magicLink.create({
      data: { token, pin, groupId, expiresAt },
    });

    return Response.json({ magicLink }, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message ?? "Errore del server" }, { status: 500 });
  }
};
