import { auth } from "@/lib/auth";
import { defineMiddleware } from "astro:middleware";

type AuthData = Awaited<ReturnType<typeof setLocals>>;

const protectedRoutes: { match: (path: string) => boolean; shouldRedirect: (authData: AuthData) => string | null }[] = [
    {
        // Only admins can access the admin panel
        match: (path) => path.startsWith("/admin"),
        shouldRedirect: (authData) => (!authData || authData.user?.role !== "admin") ? "/login" : null,
    },
    {
        // Profile requires authentication
        match: (path) => path === "/profile",
        shouldRedirect: (authData) => !authData ? "/login" : null,
    },
];

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

    const matched = protectedRoutes.find(route => route.match(context.url.pathname));
    const redirectTo = matched?.shouldRedirect(authData);
    
    return redirectTo ? context.redirect(redirectTo) : next();
});