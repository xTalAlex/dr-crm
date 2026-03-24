import type { PrismaClient } from "@/generated/prisma/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { BUCKET } from "@/lib/supabase";
import { randomBytes } from "node:crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20 MB

/** Allowed MIME types. Empty set = allow all. */
const ALLOWED_MIME_TYPES = new Set<string>([]);

export async function uploadFiles(
  prisma: PrismaClient,
  supabase: SupabaseClient,
  customerId: string,
  groupId: string,
  files: File[],
) {
  if (ALLOWED_MIME_TYPES.size > 0) {
    const rejected = files.filter((f) => !ALLOWED_MIME_TYPES.has(f.type));
    if (rejected.length > 0) {
      const names = rejected.map((f) => f.name).join(", ");
      throw new FileTypeError(`Tipo di file non consentito: ${names}`);
    }
  }

  const oversized = files.filter((f) => f.size > MAX_FILE_SIZE);
  if (oversized.length > 0) {
    const names = oversized.map((f) => f.name).join(", ");
    throw new FileSizeError(`File troppo grandi (max 5 MB): ${names}`);
  }

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  if (totalSize > MAX_TOTAL_SIZE) {
    throw new FileSizeError(`Upload troppo grande: ${(totalSize / 1024 / 1024).toFixed(1)} MB (max 20 MB)`);
  }

  const created: any[] = [];

  for (const file of files) {
    const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
    const safeName = `${randomBytes(8).toString("hex")}${ext}`;
    const storagePath = `${customerId}/${groupId}/${safeName}`;

    const buffer = await file.arrayBuffer();
    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

    if (error) {
      console.error("Supabase upload error:", error);
      continue;
    }

    const entry = await prisma.fileEntry.create({
      data: {
        fileName: file.name,
        storagePath,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        groupId,
      },
    });
    created.push(entry);
  }

  return created;
}

export class FileSizeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileSizeError";
  }
}

export class FileTypeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileTypeError";
  }
}
