import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const docsDir = "docs";
if (!statSync(docsDir).isDirectory()) {
  console.log("No docs directory to validate");
  process.exit(0);
}

const files = readdirSync(docsDir, { withFileTypes: true });
for (const entry of files) {
  if (entry.isFile() && entry.name.endsWith(".md")) {
    const content = readFileSync(join(docsDir, entry.name), "utf8");
    if (content.includes("](./")) {
      console.error(`Relative markdown link requires validation update in ${entry.name}`);
      process.exit(1);
    }
  }
}

console.log("Documentation links validated");
