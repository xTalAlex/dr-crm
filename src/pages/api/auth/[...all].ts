import { auth } from "@/lib/auth";
import type { APIRoute } from "astro";

export const prerender = false;

/**
 * If you want to use rate limiting, make sure to set the `x-forwarded-for`
 * header to the request headers from the context.
 *
 * @example
 * ctx.request.headers.set("x-forwarded-for", ctx.clientAddress);
 */
export const ALL: APIRoute = async (ctx) => {
	return auth.handler(ctx.request);
};