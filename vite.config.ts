import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    {
      name: "silence-chrome-devtools",
      configureServer(server) {
        server.middlewares.use("/.well-known", (_req, res) => {
          res.writeHead(204);
          res.end();
        });
      },
    },
  ],
  server: {
    port: 3000,
  },
  build: {
    assetsDir: "assets",
  },
  ssr: {
    noExternal: ["tw-animate-css"],
  },
});
