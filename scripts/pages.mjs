import { mkdir, copyFile, writeFile } from "node:fs/promises";

// Physical entries allow GitHub Pages to serve a directly opened/refreshed route.
for (const route of [
  "wano/tenant/v1",
  "wano/tenant/v1/overview",
  "wano/tenant/v1/detail",
]) {
  await mkdir(`dist/${route}`, { recursive: true });
  await copyFile("dist/index.html", `dist/${route}/index.html`);
}
await copyFile("dist/index.html", "dist/404.html");
await writeFile("dist/.nojekyll", "");
