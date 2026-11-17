import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const sourceFolder = (folder: string) => path.resolve(import.meta.dirname, "./src", folder);

export default defineConfig({
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
