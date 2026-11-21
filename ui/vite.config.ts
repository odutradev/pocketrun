import { existsSync, readFileSync } from "node:fs";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import type { Connect, Plugin } from "vite";
import path from "node:path";

const sourceFolder = (folder: string) => path.resolve(import.meta.dirname, "./src", folder);

const readProjectVersion = () => {
  const file = path.resolve(import.meta.dirname, "../package.json");
  if (!existsSync(file)) return "";
  const { version } = JSON.parse(readFileSync(file, "utf8")) as { version?: string };
  return version ?? "";
};

const utf8TextFiles = (): Plugin => {
  const publicFolder = path.resolve(import.meta.dirname, "./public");
  const serveText: Connect.NextHandleFunction = (request, response, next) => {
    const pathname = (request.url ?? "").split("?")[0];
    const file = path.join(publicFolder, pathname);
    if (!pathname.endsWith(".txt") || !file.startsWith(publicFolder) || !existsSync(file)) return next();
    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    response.end(readFileSync(file));
  };
  return {
    name: "utf8-text-files",
    configureServer: (server) => {
      server.middlewares.use(serveText);
    },
    configurePreviewServer: (server) => {
      server.middlewares.use(serveText);
    }
  };
};

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(readProjectVersion())
  },
  plugins: [react(), utf8TextFiles()],
  resolve: {
    alias: {
      "@actions": sourceFolder("actions"),
      "@assets": sourceFolder("assets"),
      "@components": sourceFolder("components"),
      "@hooks": sourceFolder("hooks"),
      "@pages": sourceFolder("pages"),
      "@routes": sourceFolder("routes"),
      "@stores": sourceFolder("stores"),
      "@styles": sourceFolder("styles"),
      "@utils": sourceFolder("utils")
    }
  },
  server: {
    port: 3000
  }
});
