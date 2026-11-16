// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import netlify from "@astrojs/netlify";
import markdoc from "@astrojs/markdoc";
import keystatic from "@keystatic/astro";

import sitemap from "@astrojs/sitemap";

const isNetlify = process.env.NETLIFY === "true";
const isDev = process.env.NODE_ENV === "development";

const useKeystatic = isDev || isNetlify;
export default defineConfig({
  output: isNetlify ? "server" : "static",
  site: "https://mvmntmatterspt.com",
  base: "/",
  adapter: isNetlify ? netlify({ middlewareMode: "edge" }) : undefined,

  vite: {
    plugins: [tailwindcss()],
  },

  image: {
    domains: ["images.unsplash.com", "plus.unsplash.com"],
  },

  integrations: [
    react(),
    markdoc(),
    ...(useKeystatic ? [keystatic()] : []),
    sitemap(),
  ],
});
