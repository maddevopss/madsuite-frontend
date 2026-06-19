import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  root: ".",
  build: {
    outDir: "build",
  },
  define: {
    // Inject the API URL dynamically. If it's on Vercel and hosted together, `/api` is best.
    "import.meta.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL || "/api"),
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true
      }
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
