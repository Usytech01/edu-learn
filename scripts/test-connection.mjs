import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

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

const env = loadEnv();
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const { data, error } = await supabase.rpc("validate_invite_code", {
  code: "LINCOLN01",
});

if (error) {
  if (error.code === "PGRST202") {
    console.log("Connected to Supabase, but schema not applied yet.");
    console.log("Run: npm run db:apply  (after setting SUPABASE_DB_URL in .env)");
  } else if (error.code === "PGRST205" || error.message?.includes("schema cache")) {
    console.log("Connected to Supabase, but tables do not exist yet.");
    console.log("Run: npm run db:apply  (after setting SUPABASE_DB_URL in .env)");
  } else {
    console.error("Connection error:", error.message);
    process.exit(1);
  }
} else {
  console.log("Connected to Supabase. Schema is ready.");
  console.log("Invite code validation result:", data);
}
