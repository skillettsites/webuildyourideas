import "server-only";

// Thin PostgREST client using the anon key only. Public idea rows are readable through RLS.
// Every write, and every read of private data, goes through a SECURITY DEFINER function that
// checks WBYI_SERVER_KEY. Never use the shared service-role key in this project.

const BASE = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const ANON = clean(process.env.SUPABASE_ANON_KEY);
const SERVER_KEY = clean(process.env.WBYI_SERVER_KEY);

function clean(v: string | undefined): string {
  return (v || "").replace(/\\n$/, "").trim();
}

function headers(extra: Record<string, string> = {}) {
  return { apikey: ANON, Authorization: `Bearer ${ANON}`, "Content-Type": "application/json", ...extra };
}

export function dbConfigured(): boolean {
  return Boolean(BASE && ANON && SERVER_KEY);
}

type CacheOpt = { revalidate?: number; tags?: string[] };

function cacheInit(opt?: CacheOpt): RequestInit {
  if (opt?.revalidate) return { next: { revalidate: opt.revalidate, tags: opt.tags } } as RequestInit;
  return { cache: "no-store" };
}

export async function sbSelect<T>(table: string, query: string, opt?: CacheOpt): Promise<T[]> {
  if (!BASE || !ANON) return [];
  try {
    const res = await fetch(`${BASE}/rest/v1/${table}?${query}`, { headers: headers(), ...cacheInit(opt) });
    if (!res.ok) {
      console.error("supabase select failed", table, res.status, await res.text().catch(() => ""));
      return [];
    }
    return (await res.json()) as T[];
  } catch (err) {
    console.error("supabase select error", table, err);
    return [];
  }
}

export class RpcError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

// Calls a key-gated function. Throws RpcError with the Postgres message (e.g. "rate_limited").
export async function sbRpc<T>(fn: string, args: Record<string, unknown>, opt?: CacheOpt): Promise<T> {
  if (!dbConfigured()) throw new RpcError("not_configured", 503);
  const res = await fetch(`${BASE}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ p_key: SERVER_KEY, ...args }),
    ...cacheInit(opt),
  });
  const text = await res.text();
  if (!res.ok) {
    let message = "error";
    try {
      message = (JSON.parse(text) as { message?: string }).message || message;
    } catch {}
    if (!["rate_limited", "round_limit"].includes(message)) console.error("supabase rpc failed", fn, res.status, text);
    throw new RpcError(message, res.status);
  }
  if (!text.trim()) return null as T;
  return JSON.parse(text) as T;
}
