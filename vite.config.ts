import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualEdits } from "@emergentbase/visual-edits/vite";

const hotReloadDisabled = process.env.DISABLE_HOT_RELOAD === "true";
const visualEditsDisabled = process.env.DISABLE_VISUAL_EDITS === "true";

if (!hotReloadDisabled) {
  process.env.CHOKIDAR_USEPOLLING = "true";
}

export default defineConfig({
  // GitHub Pages hosts this project below /digicon/. Other deployments remain at /.
  base: process.env.GITHUB_ACTIONS ? "/digicon/" : "/",
  plugins: [
    react(),
    tailwindcss(),
    ...(visualEditsDisabled ? [] : [visualEdits()]),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      "@base-ui/react/button",
      "@base-ui/react/checkbox",
      "@base-ui/react/dialog",
      "@base-ui/react/input",
      "@base-ui/react/menu",
      "@base-ui/react/merge-props",
      "@base-ui/react/popover",
      "@base-ui/react/select",
      "@base-ui/react/tabs",
      "@base-ui/react/use-render",
      "@tanstack/react-query",
      "class-variance-authority",
      "clsx",
      "date-fns",
      "lucide-react",
      "motion/react",
      "next-themes",
      "react",
      "react-day-picker",
      "react-dom/client",
      "react-is",
      "react-router-dom",
      "recharts",
      "sonner",
      "tailwind-merge",
    ],
  },
  server: {
    host: true,
    port: 3000,
    allowedHosts: true,
    hmr: !hotReloadDisabled,
    watch: hotReloadDisabled ? null : { usePolling: true, interval: 300 },
    proxy: {
      "/api": {
        target: "http://localhost:8001",
        changeOrigin: true,
      },
    },
  },
});
