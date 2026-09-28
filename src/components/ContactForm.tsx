"use client";

import { useState } from "react";
import { track } from "@/lib/track";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, message, website }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setState("done");
      track("contact_sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-[28px] bg-green-soft p-8" role="status">
        <p className="title">Thanks, we’ve got it.</p>
        <p className="mt-2 text-[17px] text-ink-2">We read every message and usually reply within one working day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="field-label">
            Name
          </label>
          <input id="c-name" className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="c-email" className="field-label">
            Email
          </label>
          <input id="c-email" type="email" required className="field" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
      </div>
      <div>
        <label htmlFor="c-msg" className="field-label">
          Message
        </label>
        <textarea id="c-msg" required className="field min-h-[160px] resize-y" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={4000} />
      </div>
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="c-web">Website</label>
        <input id="c-web" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>
      {error && (
        <p role="alert" className="rounded-2xl bg-[#fff2f2] px-4 py-3 text-[15px] text-[#b3261e]">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={state === "busy"}>
        {state === "busy" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
