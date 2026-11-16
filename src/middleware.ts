import { defineMiddleware } from "astro:middleware";

const productionURL = "https://mvmntmatterspt.com";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  // Only run this logic on Netlify
  if (process.env.NETLIFY !== "true") {
    return next();
  }

  // Routes that must remain accessible on Netlify
  const isKeystatic =
    pathname === "/keystatic" || pathname.startsWith("/keystatic/");

  const isNetlifyFunction = pathname.startsWith("/.netlify/functions/");

  const isKeystaticAPI =
    pathname === "/api/keystatic" || pathname.startsWith("/api/keystatic/");

  if (!isKeystatic && !isNetlifyFunction && !isKeystaticAPI) {
    const destination = new URL(pathname + context.url.search, productionURL);
    const response = Response.redirect(destination, 302);

    response.headers.set("X-Debug-Middleware", "redirect");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");

    return response;
  }

  // Continue processing allowed routes
  const response = await next();

  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("X-Debug-Middleware", "executed");
  return response;
});
