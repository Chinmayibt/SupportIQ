import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  /** Load `VITE_*` from repo root `.env` next to `src/`, not only `frontend/.env`. */
  envDir: path.resolve(__dirname, ".."),
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        rewrite: (reqPath) => reqPath.replace(/^\/api/, ""),
      },
    },
  },
});
