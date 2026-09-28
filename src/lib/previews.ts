import "server-only";
import type { AccentId, LayoutId, SiteContent } from "./site/content";
import { sbRpc } from "./supabase";

export type PreviewRow = {
  id: string;
  name: string;
  dump: string;
  site: SiteContent;
  layout: LayoutId;
  accent: AccentId;
  edits_used: number;
  domain: string | null;
  email: string | null;
  plan: string | null;
  status: "preview" | "requested" | "paid" | "live" | "closed";
  created_at: string;
};

export const LAYOUT_IDS: LayoutId[] = ["classic", "bold", "studio", "minimal", "event"];
export const ACCENT_IDS: AccentId[] = ["blue", "green", "teal", "orange", "pink", "purple", "graphite"];

export function newPreviewId(): string {
  const alphabet = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function validPreviewId(id: string): boolean {
  return /^[a-zA-Z0-9]{12}$/.test(id);
}

export async function getPreview(id: string): Promise<PreviewRow | null> {
  if (!validPreviewId(id)) return null;
  const rows = await sbRpc<PreviewRow[]>("wbyi_get_preview", { p_id: id });
  return rows?.[0] ?? null;
}

export function validDomain(d: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.(?:com|co\.uk)$/.test(d);
}
