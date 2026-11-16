import { defineMiddleware } from "astro:middleware";

const productionURL = "https://mvmntmatterspt.com";
const netlifyHostname = "superb-dango-747faa.netlify.app";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, hostname, search } = context.url;

  // Only apply this middleware logic to the deployed Netlify domain.
  // Local development and GitHub Pages remain unaffected.
  if (hostname !== netlifyHostname) {
    return next();
  }

  // Routes that must remain accessible on Netlify.
  const isKeystatic =
    pathname === "/keystatic" || pathname.startsWith("/keystatic/");

  const isKeystaticAPI =
    pathname === "/api/keystatic" || pathname.startsWith("/api/keystatic/");

  const isNetlifyFunction = pathname.startsWith("/.netlify/functions/");

  // Static assets needed by the Keystatic admin interface.
  const isStaticAsset =
    pathname.startsWith("/_astro/") ||
    pathname === "/_image" ||
    pathname.startsWith("/_image/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt";

  // Redirect public pages to the official GitHub Pages domain.
  if (!isKeystatic && !isKeystaticAPI && !isNetlifyFunction && !isStaticAsset) {
    const destination = new URL(pathname + search, productionURL);

    // Construct the redirect with headers already defined.
    // Response.redirect() creates immutable headers in this runtime.
    return new Response(null, {
      status: 302,
      headers: {
        Location: destination.toString(),
        "X-Robots-Tag": "noindex, nofollow",
        "X-Debug-Middleware": "redirect",
      },
    });
  }

  // Allow Keystatic, its API, functions, and static assets to proceed.
  const response = await next();

  // Clone the headers because the original response may be immutable.
  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", "noindex, nofollow");
  headers.set("X-Debug-Middleware", "executed");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
