import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnv() {
  const lines = readFileSync(join(root, ".env"), "utf8").split(/\r?\n/);
  return Object.fromEntries(
    lines
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const idx = line.indexOf("=");
        return [line.slice(0, idx), line.slice(idx + 1)];
      })
  );
}

async function main() {
  const env = loadEnv();
  const dbUrl = env.SUPABASE_DB_URL;

  if (!dbUrl) {
    console.error(
      "Missing SUPABASE_DB_URL in .env\n\n" +
        "Add your database connection string from:\n" +
        "Supabase Dashboard → Project Settings → Database → Connection string (URI)\n\n" +
        "Use the Session pooler URI and replace [YOUR-PASSWORD] with your database password.\n" +
        "Example:\n" +
        "SUPABASE_DB_URL=postgresql://postgres.hrenlowgcxtzotfnszct:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
    );
    process.exit(1);
  }

  const migrationsDir = join(root, "supabase", "migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("Connected to Supabase database.\n");

  try {
    for (const file of files) {
      const sql = readFileSync(join(migrationsDir, file), "utf8");
      console.log(`Applying ${file}...`);
      await client.query(sql);
      console.log(`  ✓ ${file}`);
    }

    const seed = readFileSync(join(root, "supabase", "seed.sql"), "utf8");
    console.log("Applying seed.sql...");
    await client.query(seed);
    console.log("  ✓ seed.sql");

    const { rows } = await client.query(
      "SELECT id, name, invite_code FROM public.institutions"
    );
    console.log("\nInstitutions in database:");
    console.table(rows);
    console.log("\nAll migrations applied successfully.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
