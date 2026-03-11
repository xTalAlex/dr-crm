import { auth } from "@/lib/auth";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
    const authData = await setLocals(context);
    const { pathname } = context.url;

    if (pathname.startsWith("/admin") && authData?.user?.role !== "admin") {
        return pathname.startsWith("/admin/api/")
            ? new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } })
            : context.redirect("/auth/login");
    }

    return next();
});

/**
 * Populates Astro.locals with auth session data.
 * If you add new values here, update the Locals interface in types.d.ts accordingly.
 */
async function setLocals(context: Parameters<Parameters<typeof defineMiddleware>[0]>[0]) {
    const authData = await auth.api.getSession({
        headers: context.request.headers,
    });

    context.locals.user = authData?.user ?? null;
    context.locals.session = authData?.session ?? null;

    return authData;
}