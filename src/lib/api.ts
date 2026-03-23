import type { APIContext, APIRoute } from "astro";
import type { PrismaClient } from "@/generated/prisma/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getDb } from "@/lib/db";
import { getSupabase } from "@/lib/supabase";
import { FileSizeError } from "@/lib/file-upload";

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
    try {
      return await fn(ctx, { prisma: getDb(), supabase: getSupabase() });
    } catch (err: any) {
      if (err instanceof ApiError) {
        return Response.json({ error: err.message }, { status: err.status });
      }
      if (err instanceof FileSizeError) {
        return Response.json({ error: err.message }, { status: 413 });
      }
      return Response.json(
        { error: err.message ?? "Errore del server" },
        { status: 500 },
      );
    }
  };
}
