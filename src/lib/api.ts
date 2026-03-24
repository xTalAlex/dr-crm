import type { APIContext, APIRoute } from "astro";
import type { PrismaClient } from "@/generated/prisma/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getDb } from "@/lib/db";
import { getSupabase } from "@/lib/supabase";
import { FileSizeError, FileTypeError } from "@/lib/file-upload";
import { logError } from "@/lib/log";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

interface Deps {
  prisma: PrismaClient;
  supabase: SupabaseClient;
}

type HandlerFn = (ctx: APIContext, deps: Deps) => Promise<Response>;

export function apiHandler(fn: HandlerFn): APIRoute {
  return async (ctx) => {
    let status = 500;
    let message = "Errore del server";

    try {
      return await fn(ctx, { prisma: getDb(), supabase: getSupabase() });
    } catch (err) {
      if (err instanceof ApiError) {
        status = err.status;
        message = err.message;
      } else if (err instanceof FileSizeError) {
        status = 413;
        message = err.message;
      } else if (err instanceof FileTypeError) {
        status = 415;
        message = err.message;
      } else {
        logError(ctx.url.pathname, err);
      }
    }

    return Response.json({ error: message }, { status });
  };
}
