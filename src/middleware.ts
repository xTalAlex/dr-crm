import { auth } from "@/lib/auth";
import { defineMiddleware } from "astro:middleware";

const protectedRoutes: Record<string, (authData: Awaited<ReturnType<typeof setLocals>>) => boolean> = {
    "/profile": (authData) => !authData,
    "/admin": (authData) => !authData || authData.user?.role !== "admin",
};

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

export const onRequest = defineMiddleware(async (context, next) => {
    const authData = await setLocals(context);

    const shouldRedirect = protectedRoutes[context.url.pathname];
    if (shouldRedirect?.(authData)) {
        return context.redirect("/");
    }
    
    return next();
});