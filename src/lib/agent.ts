import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

// Machine access for Claude sessions and scheduled jobs working the request queue.
export function agentAuthorised(headers: Headers): boolean {
  const key = (process.env.AGENT_KEY || "").replace(/\\n$/, "").trim();
  if (key.length < 24) return false;
  const got = (headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  const a = createHash("sha256").update(got).digest();
  const b = createHash("sha256").update(key).digest();
  return timingSafeEqual(a, b);
}
