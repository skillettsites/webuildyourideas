"use client";

import { useState } from "react";
import { track } from "@/lib/track";

export function NewsletterForm({ source = "footer", dark = false }: { source?: string; dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setState("done");
      track("newsletter_signup", { source });
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (state === "done") {
    return (
      <p className={`text-[15px] ${dark ? "text-white" : "text-ink"}`} role="status">
        You’re on the list. See you on Monday.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md">
      <div className="flex gap-2">
        <label htmlFor={`nl-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`nl-${source}`}
          type="email"
          required
          autoComplete="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`field !py-2.5 !text-[15px] ${dark ? "!border-white/20 !bg-white/10 !text-white placeholder:!text-white/50" : ""}`}
        />
        <button type="submit" className="btn btn-primary btn-sm !px-4 shrink-0" disabled={state === "busy"}>
          {state === "busy" ? "Joining…" : "Join"}
        </button>
      </div>
      {state === "error" && (
        <p className="mt-2 text-[13px] text-[#d70015]" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
