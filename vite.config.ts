import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Served at a subpath on GitHub Pages (xedaai.github.io/xeda-website/); at root
  // everywhere else (local dev, and any custom domain / Vercel / Cloudflare).
  base: process.env.GITHUB_PAGES === "true" ? "/xeda-website/" : "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Keep the React runtime in its own long-cache chunk, separate from app code.
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          // Three.js is large and only used by the lazy hero scene — keep it in
          // its own long-cache chunk so it never bloats the app bundle.
          three: ["three"],
        },
      },
    },
  },
}));
