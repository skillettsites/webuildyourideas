"use client";

import { useEffect, useSyncExternalStore } from "react";
import { track } from "./track";

// One shared record of which ideas this browser has voted for, plus live counts,
// so every vote button on a page stays in step. Pages are cached for a few seconds,
// so buttons register their idea and the store fetches fresh counts in one request.
type State = { loaded: boolean; voted: Set<string>; counts: Map<string, number>; busy: Set<string> };

let state: State = { loaded: false, voted: new Set(), counts: new Map(), busy: new Set() };
const listeners = new Set<() => void>();
const wanted = new Set<string>();
const fetched = new Set<string>();
let timer: ReturnType<typeof setTimeout> | null = null;

function emit() {
  state = { ...state };
  listeners.forEach((l) => l());
}

function scheduleFetch() {
  if (timer) return;
  timer = setTimeout(async () => {
    timer = null;
    const ids = Array.from(wanted).filter((id) => !fetched.has(id)).slice(0, 100);
    const first = !state.loaded;
    if (!ids.length && !first) return;
    ids.forEach((id) => fetched.add(id));
    try {
      const res = await fetch(`/api/votes${ids.length ? `?ids=${ids.join(",")}` : ""}`, { cache: "no-store" });
      const d = (await res.json()) as { ids?: string[]; counts?: Record<string, number> };
      if (first) state.voted = new Set(d.ids ?? []);
      for (const [id, n] of Object.entries(d.counts ?? {})) if (!state.busy.has(id)) state.counts.set(id, n);
    } catch {}
    state.loaded = true;
    emit();
  }, 40);
}

function subscribe(l: () => void) {
  listeners.add(l);
  scheduleFetch();
  return () => listeners.delete(l);
}

const getSnapshot = () => state;
const serverSnapshot: State = { loaded: false, voted: new Set(), counts: new Map(), busy: new Set() };

export function useVotes(ideaId?: string) {
  useEffect(() => {
    if (ideaId && !wanted.has(ideaId)) {
      wanted.add(ideaId);
      scheduleFetch();
    }
  }, [ideaId]);
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
}

export async function toggleVote(ideaId: string, currentCount: number): Promise<{ error?: string }> {
  if (state.busy.has(ideaId)) return {};
  const wasVoted = state.voted.has(ideaId);
  // Optimistic update.
  state.busy.add(ideaId);
  if (wasVoted) state.voted.delete(ideaId);
  else state.voted.add(ideaId);
  state.counts.set(ideaId, Math.max(0, currentCount + (wasVoted ? -1 : 1)));
  emit();
  try {
    const res = await fetch(`/api/ideas/${ideaId}/vote`, { method: "POST" });
    const data = (await res.json()) as { voted?: boolean; votes?: number; error?: string };
    if (typeof data.votes === "number") state.counts.set(ideaId, data.votes);
    if (data.voted) state.voted.add(ideaId);
    else state.voted.delete(ideaId);
    if (!res.ok || data.error) return { error: data.error || "That vote did not go through. Please try again." };
    track(data.voted ? "vote" : "unvote", { idea_id: ideaId });
    return {};
  } catch {
    if (wasVoted) state.voted.add(ideaId);
    else state.voted.delete(ideaId);
    state.counts.set(ideaId, currentCount);
    return { error: "No connection. Please try again." };
  } finally {
    state.busy.delete(ideaId);
    emit();
  }
}
