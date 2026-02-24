import { mkdir, writeFile } from "node:fs/promises";

const path = "sbom/sbom.spdx.json";
await mkdir("sbom", { recursive: true });
await writeFile(path, JSON.stringify({ generatedAt: new Date().toISOString(), package: "language-commerce" }, null, 2));
console.log(`SBOM generated at ${path}`);
