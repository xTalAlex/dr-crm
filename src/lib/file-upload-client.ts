import {
  MAX_FILE_SIZE,
  MAX_TOTAL_SIZE,
  filesTooLargeMessage,
  uploadTooLargeMessage,
} from "@/lib/file-limits";

export function validateFiles(files: FileList | null): string | null {
  if (!files || files.length === 0) return "Seleziona almeno un file";

  const oversized = Array.from(files).filter((f) => f.size > MAX_FILE_SIZE);
  if (oversized.length > 0)
    return filesTooLargeMessage(oversized.map((f) => f.name).join(", "));

  const totalSize = Array.from(files).reduce((sum, f) => sum + f.size, 0);
  if (totalSize > MAX_TOTAL_SIZE) return uploadTooLargeMessage(totalSize);

  return null;
}

export async function uploadFiles(
  url: string,
  files: FileList,
  label?: string,
): Promise<{ error: string | null; warning: string | null }> {
  const fd = new FormData();
  if (label) fd.append("label", label);
  for (const f of files) fd.append("files", f);

  let error: string | null = null;
  let warning: string | null = null;

  const res = await fetch(url, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    error = err.error || "Errore nel caricamento";
  } else {
    const data = await res.json().catch(() => ({}));
    const failed: string[] = data.failed ?? [];
    if (failed.length > 0) {
      warning = `Upload parziale: falliti ${failed.join(", ")}`;
    }
  }

  return { error, warning };
}
