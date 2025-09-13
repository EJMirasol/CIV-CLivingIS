import type { Config } from "@react-router/dev/config";

export default {
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  buildDirectory: "build",
  publicPath: "/",
  serverBuildFile: "server/index.js",
  serverConditions: ["workerd", "worker", "browser"],
  serverMainFields: ["browser", "module", "main"],
  serverMinify: true,
  serverModuleFormat: "esm",
  serverPlatform: "neutral",
} satisfies Config;
