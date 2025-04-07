
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add optimizeDeps to prevent issues with Node.js modules
  optimizeDeps: {
    esbuildOptions: {
      // Define empty NodeJS globals for browser usage
      define: {
        global: 'globalThis',
      },
    },
  },
  // Add Node.js polyfills for browser environment
  define: {
    'process.env': {},
  },
}));
