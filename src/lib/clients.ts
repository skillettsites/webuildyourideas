import "server-only";
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { PLAN_ALLOWANCE, SIZE_UNITS, type PlanId, type RequestSize } from "./plans";
import { isUuid } from "./security";
import { sbRpc } from "./supabase";

export const CLIENT_COOKIE = "wbyi_client";
// Readable by the page, holds no secret: only tells the nav to say "Your account".
export const SIGNED_IN_HINT = "wbyi_in";
const SESSION_DAYS = 90;

function secret(): string {
  const s = (process.env.SESSION_SECRET || "").replace(/\\n$/, "").trim();
  if (s.length < 24) throw new Error("SESSION_SECRET is not set");
  return s;
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex").slice(0, 40);
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

// ---------- Sessions ----------

export function sessionValue(clientId: string): { value: string; maxAge: number } {
  const exp = Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400;
  return { value: `${clientId}.${exp}.${sign(`${clientId}.${exp}`)}`, maxAge: SESSION_DAYS * 86400 };
}

export function readSession(value: string | undefined): string | null {
  if (!value) return null;
  const [id, exp, sig] = value.split(".");
  if (!isUuid(id) || !/^\d+$/.test(exp || "") || !sig) return null;
  if (Number(exp) < Date.now() / 1000) return null;
  return safeEqual(sig, sign(`${id}.${exp}`)) ? id : null;
}

export async function currentClientId(): Promise<string | null> {
  return readSession((await cookies()).get(CLIENT_COOKIE)?.value);
}

export const sessionCookieOptions = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" };

// ---------- Sign-in codes ----------

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function newLoginSecrets() {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const token = randomBytes(24).toString("hex");
  return { code, token };
}

export function hashCode(email: string, code: string): string {
  return createHash("sha256").update(`${secret()}:code:${normaliseEmail(email)}:${code.trim()}`).digest("hex");
}

export function hashToken(email: string, token: string): string {
  return createHash("sha256").update(`${secret()}:token:${normaliseEmail(email)}:${token.trim()}`).digest("hex");
}

// ---------- Allowance period ----------

function clampDay(year: number, month: number, day: number): Date {
  const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(day, last)));
}

// The allowance resets each month on the day the account was opened.
export function allowancePeriod(anchorDay: number, now = new Date()): { start: Date; end: Date } {
  let start = clampDay(now.getUTCFullYear(), now.getUTCMonth(), anchorDay);
  if (start > now) start = clampDay(now.getUTCFullYear(), now.getUTCMonth() - 1, anchorDay);
  const end = clampDay(start.getUTCFullYear(), start.getUTCMonth() + 1, anchorDay);
  return { start, end };
}

export function allowancePercent(plan: PlanId, usedUnits: number): number {
  const cap = PLAN_ALLOWANCE[plan] ?? PLAN_ALLOWANCE.starter;
  return Math.min(100, Math.round((usedUnits / cap) * 100));
}

export function unitsFor(size: RequestSize | null): number {
  return size ? SIZE_UNITS[size] : 0;
}

// ---------- Types + reads ----------

export type ClientSite = { id: string; name: string; url: string | null; status: string };
export type RequestStatus = "new" | "in_progress" | "needs_info" | "done" | "declined";
export type RequestSummary = {
  id: string;
  ref: number;
  title: string;
  status: RequestStatus;
  size: RequestSize | null;
  site_id: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  messages: number;
  last_author: "client" | "team" | null;
};
export type ClientHome = {
  client: { id: string; email: string; name: string; company: string | null; plan: PlanId; anchor_day: number; created_at: string };
  sites: ClientSite[];
  requests: RequestSummary[];
  updates: { id: string; title: string; body: string | null; request_id: string | null; created_at: string }[];
  used_units: number;
};

export type RequestDetail = {
  request: {
    id: string;
    ref: number;
    title: string;
    details: string;
    status: RequestStatus;
    size: RequestSize | null;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
    site_id: string | null;
    site: { name: string; url: string | null; repo: string | null } | null;
    client: { id: string; name: string; email: string; plan: PlanId };
  };
  messages: { id: string; author: "client" | "team"; body: string; created_at: string }[];
  attachments: { id: string; message_id: string | null; uploaded_by: "client" | "team"; filename: string; mime: string; bytes: number; created_at: string }[];
};

export async function getClientHome(clientId: string): Promise<ClientHome | null> {
  // Period depends on the client's anchor day, so read it first with an early "since".
  const first = await sbRpc<ClientHome | null>("wbyi_client_home", { p_client_id: clientId, p_since: new Date(Date.now() - 31 * 86400000).toISOString() });
  if (!first?.client) return null;
  const { start } = allowancePeriod(first.client.anchor_day);
  const home = await sbRpc<ClientHome>("wbyi_client_home", { p_client_id: clientId, p_since: start.toISOString() });
  return home;
}

export async function getRequest(clientId: string | null, requestId: string): Promise<RequestDetail | null> {
  if (!isUuid(requestId)) return null;
  return sbRpc<RequestDetail | null>("wbyi_request_get", { p_client_id: clientId, p_request_id: requestId });
}

export const STATUS_LABEL: Record<RequestStatus, string> = {
  new: "Received",
  in_progress: "In progress",
  needs_info: "Needs your input",
  done: "Done",
  declined: "Closed",
};

// ---------- Attachments ----------

export const ALLOWED_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "application/pdf": "pdf",
  "text/plain": "txt",
  "text/csv": "csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/msword": "doc",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
};
export const MAX_FILE_BYTES = 4_000_000;

export function cleanFilename(name: string): string {
  return name.replace(/[^\w.\- ()]+/g, "_").replace(/\s+/g, " ").trim().slice(0, 140) || "file";
}
