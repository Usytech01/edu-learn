import { renameSync, existsSync, mkdirSync, cpSync, rmSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const tempDir = join(root, "next-app-temp");

function moveFileOrFolder(name) {
  const src = join(tempDir, name);
  const dest = join(root, name);
  if (existsSync(src)) {
    console.log(`Moving ${name}...`);
    cpSync(src, dest, { recursive: true });
    console.log(`  ✓ Moved ${name}`);
  }
}

try {
  moveFileOrFolder("src");
  moveFileOrFolder("public");
  moveFileOrFolder("tsconfig.json");
  moveFileOrFolder("next.config.ts");
  moveFileOrFolder("next-env.d.ts");
  moveFileOrFolder("eslint.config.mjs");

  console.log("Next.js files moved successfully. Cleaning up temp directory...");
  rmSync(tempDir, { recursive: true, force: true });
  console.log("  ✓ Temp directory deleted.");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exit(1);
}
