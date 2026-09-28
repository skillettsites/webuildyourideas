import "server-only";
import { NextResponse } from "next/server";
import { RpcError } from "./supabase";

export function ok(data: Record<string, unknown> = {}, init?: ResponseInit) {
  return NextResponse.json({ ok: true, ...data }, init);
}

export function fail(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    return {} as T;
  }
}

const MESSAGES: Record<string, string> = {
  rate_limited: "You’ve done that a few times today. Please try again tomorrow.",
  round_limit: "You can share up to three ideas each round. Please try again next week.",
  email_invalid: "Please enter a valid email address.",
  title_length: "Please give your idea a short title (4 to 80 characters).",
  description_length: "Please describe your idea in at least a sentence or two.",
  category_invalid: "Please choose a category.",
  message_length: "Please write a short message.",
  not_configured: "This isn’t switched on yet. Please try again shortly.",
};

export function rpcFail(err: unknown) {
  if (err instanceof RpcError) {
    const msg = MESSAGES[err.message];
    if (msg) return fail(msg, err.message === "rate_limited" || err.message === "round_limit" ? 429 : err.status >= 500 ? 503 : 400);
  }
  console.error("request failed", err);
  return fail("Something went wrong on our side. Please try again.", 500);
}
