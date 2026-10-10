/**
 *  Shared upload limits and user-facing size messages.
 * 
 *  Netlify max request size is ~4.5 MB.
 */

const MB = 1024 * 1024;

export const MAX_FILE_SIZE = 4.5 * MB;

export const MAX_TOTAL_SIZE = 4.5 * MB;

export const MAX_FILE_SIZE_MB = MAX_FILE_SIZE / MB;
export const MAX_TOTAL_SIZE_MB = MAX_TOTAL_SIZE / MB;

export const ALLOWED_MIME_TYPES = new Set<string>([]);

export function filesTooLargeMessage(names: string): string {
  return `File troppo grandi (max ${MAX_FILE_SIZE_MB} MB): ${names}`;
}

export function uploadTooLargeMessage(totalBytes: number): string {
  return `Upload troppo grande: ${(totalBytes / MB).toFixed(1)} MB (max ${MAX_TOTAL_SIZE_MB} MB)`;
}

export function fileTypeNotAllowedMessage(names: string): string {
  return `Tipo di file non consentito: ${names}`;
}
