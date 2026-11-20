import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Match directory URL handling on GitHub Pages so relative demo assets resolve.
function redirectDemoDirectory(server) {
  const path = server.config.base + "wano/v1";
  server.middlewares.use((req, res, next) => {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname !== path) return next();
    res.writeHead(308, { Location: path + "/" + url.search });
    res.end();
  });
}

export default defineConfig({
  plugins: [
    vue(),
    {
      name: "demo-directory-url",
      configureServer: redirectDemoDirectory,
      configurePreviewServer: redirectDemoDirectory,
    },
  ],
  appType: "mpa",
  base: process.env.BASE_PATH || "/",
  server: { host: "0.0.0.0", allowedHosts: ["terminal.local"] },
});
