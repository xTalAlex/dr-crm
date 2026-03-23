const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_TOTAL_SIZE = 20 * 1024 * 1024;

export function validateFiles(files: FileList | null): string | null {
  if (!files || files.length === 0) return "Seleziona almeno un file";

  const oversized = Array.from(files).filter((f) => f.size > MAX_FILE_SIZE);
  if (oversized.length > 0)
    return `File troppo grandi (max 5 MB): ${oversized.map((f) => f.name).join(", ")}`;

  const totalSize = Array.from(files).reduce((sum, f) => sum + f.size, 0);
  if (totalSize > MAX_TOTAL_SIZE)
    return `Upload troppo grande: ${(totalSize / 1024 / 1024).toFixed(1)} MB (max 20 MB)`;

  return null;
}

export async function uploadFiles(
  url: string,
  files: FileList,
  label?: string,
): Promise<string | null> {
  const fd = new FormData();
  if (label) fd.append("label", label);
  for (const f of files) fd.append("files", f);

  const res = await fetch(url, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return err.error || "Errore nel caricamento";
  }

  return null;
}
