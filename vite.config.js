import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Match directory URL handling on GitHub Pages so relative demo assets resolve.
function redirectDemoDirectory(server) {
  const directories = ["wano", "wano/v1"].map((path) => server.config.base + path);
  server.middlewares.use((req, res, next) => {
    const url = new URL(req.url, "http://localhost");
    if (!directories.includes(url.pathname)) return next();
    res.writeHead(308, { Location: url.pathname + "/" + url.search });
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
  build: { rollupOptions: { input: ["index.html", "wano/index.html"] } },
  appType: "mpa",
  base: process.env.BASE_PATH || "/",
  server: { host: "0.0.0.0", allowedHosts: ["terminal.local"] },
});
