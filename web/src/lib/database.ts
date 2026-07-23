import "server-only";
import { neon } from "@neondatabase/serverless";
import type { StoredPayload } from "@/lib/data-schema";

type StateRow = {
  data: StoredPayload;
};

function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }
  return neon(connectionString);
}

async function ensureTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS rehello_state (
      id SMALLINT PRIMARY KEY CHECK (id = 1),
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  return sql;
}

export async function loadState(): Promise<StoredPayload | null> {
  const sql = await ensureTable();
  const rows = await sql`SELECT data FROM rehello_state WHERE id = 1`;
  return (rows as StateRow[])[0]?.data ?? null;
}

export async function saveState(payload: StoredPayload) {
  const sql = await ensureTable();
  const serialized = JSON.stringify(payload);
  await sql`
    INSERT INTO rehello_state (id, data, updated_at)
    VALUES (1, ${serialized}::jsonb, NOW())
    ON CONFLICT (id)
    DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
  `;
}
