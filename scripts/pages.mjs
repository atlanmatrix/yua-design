import { cp, writeFile } from "node:fs/promises";

await cp("wano/v1", "dist/wano/v1", { recursive: true });
await writeFile("dist/.nojekyll", "");
