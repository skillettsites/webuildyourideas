import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

function env(name: string): string {
  return (process.env[name] || "").replace(/\\n$/, "").trim();
}

export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") || "0.0.0.0";
}

export function ipHash(headers: Headers): string {
  return createHash("sha256")
    .update(`${clientIp(headers)}|${env("IP_HASH_SALT")}`)
    .digest("hex")
    .slice(0, 32);
}

export const VOTER_COOKIE = "wbyi_vid";
export const ADMIN_COOKIE = "wbyi_admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string | undefined | null): value is string {
  return Boolean(value && UUID.test(value));
}

function hmac(value: string): string {
  return createHmac("sha256", env("ADMIN_SECRET") || "unset").update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function adminConfigured(): boolean {
  return env("ADMIN_SECRET").length >= 12;
}

export function checkAdminPassword(password: string): boolean {
  return adminConfigured() && safeEqual(password, env("ADMIN_SECRET"));
}

export function adminSessionValue(): string {
  return hmac("admin-session-v1");
}

export function isAdminSession(cookieValue: string | undefined): boolean {
  return Boolean(adminConfigured() && cookieValue && safeEqual(cookieValue, adminSessionValue()));
}

// One-tap moderation links sent to Telegram.
export function signModeration(id: string, action: string): string {
  return hmac(`moderate:${id}:${action}`).slice(0, 32);
}

export function verifyModeration(id: string, action: string, sig: string): boolean {
  return adminConfigured() && safeEqual(sig, signModeration(id, action));
}

export function cronAuthorised(headers: Headers): boolean {
  const secret = env("CRON_SECRET");
  return Boolean(secret) && headers.get("authorization") === `Bearer ${secret}`;
}
