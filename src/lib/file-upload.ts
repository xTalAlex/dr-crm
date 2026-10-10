import type { PrismaClient } from "@/generated/prisma/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { BUCKET } from "@/lib/supabase";
import { randomBytes } from "node:crypto";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  MAX_TOTAL_SIZE,
  fileTypeNotAllowedMessage,
  filesTooLargeMessage,
  uploadTooLargeMessage,
} from "@/lib/file-limits";

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
      throw new FileTypeError(fileTypeNotAllowedMessage(names));
    }
  }

  const oversized = files.filter((f) => f.size > MAX_FILE_SIZE);
  if (oversized.length > 0) {
    const names = oversized.map((f) => f.name).join(", ");
    throw new FileSizeError(filesTooLargeMessage(names));
  }

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  if (totalSize > MAX_TOTAL_SIZE) {
    throw new FileSizeError(uploadTooLargeMessage(totalSize));
  }

  const created: any[] = [];
  const failed: string[] = [];

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
      failed.push(file.name);
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

  return { created, failed };
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
