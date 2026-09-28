"use client";

import { useState } from "react";

export function ManageIdea({ token, removable }: { token: string; removable: boolean }) {
  const [state, setState] = useState<"idle" | "confirm" | "busy" | "done" | "error">("idle");
  const [error, setError] = useState("");

  if (!removable) {
    return <p className="text-[15px] text-mute">This idea can’t be removed from here. If you need help, use the contact page.</p>;
  }
  if (state === "done") return <p className="text-[15px] text-ink">Your idea has been removed from the site.</p>;

  async function remove() {
    setState("busy");
    const res = await fetch("/api/manage", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token }) });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (res.ok && data.ok) setState("done");
    else {
      setError(data.error || "Something went wrong. Please try again.");
      setState("error");
    }
  }

  return (
    <div>
      <p className="text-[15px] text-mute">Changed your mind? You can take your idea off the board. This can’t be undone, and its votes will be lost.</p>
      {state === "confirm" || state === "busy" ? (
        <div className="mt-4 flex gap-3">
          <button type="button" onClick={remove} disabled={state === "busy"} className="btn btn-sm bg-[#d70015] text-white">
            {state === "busy" ? "Removing…" : "Yes, remove it"}
          </button>
          <button type="button" onClick={() => setState("idle")} className="btn btn-sm btn-secondary">
            Keep it
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setState("confirm")} className="btn btn-sm btn-secondary mt-4">
          Remove my idea
        </button>
      )}
      {state === "error" && <p className="mt-3 text-[14px] text-[#b3261e]">{error}</p>}
    </div>
  );
}
