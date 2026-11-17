import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const sourceFolder = (folder: string) => path.resolve(import.meta.dirname, "./src", folder);

const readProjectVersion = () => {
  const file = path.resolve(import.meta.dirname, "../package.json");
  if (!existsSync(file)) return "";
  const { version } = JSON.parse(readFileSync(file, "utf8")) as { version?: string };
  return version ?? "";
};

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(readProjectVersion())
  },
  plugins: [react()],
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
