"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CATEGORIES, LIMITS } from "@/lib/config";
import { track } from "@/lib/track";

export function SubmitIdeaForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [updates, setUpdates] = useState(false);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const started = useRef(0);
  const honey = useRef<HTMLInputElement>(null);

  useEffect(() => {
    started.current = Date.now();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!category) {
      setError("Please choose a category.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          name,
          email,
          updates,
          agree,
          website: honey.current?.value || "",
          started: started.current,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; slug?: string | null; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      track("idea_submitted", { category });
      if (data.slug) router.push(`/ideas/${data.slug}?new=1`);
      else router.push("/ideas");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  const titleLeft = LIMITS.titleMax - title.length;
  const descLeft = LIMITS.descriptionMax - description.length;

  return (
    <form onSubmit={submit} className="space-y-7" noValidate={false}>
      <div>
        <label htmlFor="title" className="field-label">
          Your idea, in a few words
        </label>
        <input
          id="title"
          className="field"
          required
          minLength={LIMITS.titleMin}
          maxLength={LIMITS.titleMax}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="An app that splits bills in shared houses"
          autoComplete="off"
        />
        <p className={`field-hint ${titleLeft < 10 ? "text-orange" : ""}`}>{titleLeft} characters left</p>
      </div>

      <div>
        <label htmlFor="description" className="field-label">
          Describe it
        </label>
        <textarea
          id="description"
          className="field min-h-[160px] resize-y"
          required
          minLength={LIMITS.descriptionMin}
          maxLength={LIMITS.descriptionMax}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does it do? Who is it for? Why would people use it?"
        />
        <p className={`field-hint ${descLeft < 60 ? "text-orange" : ""}`}>
          The clearer it is, the more votes it gets. {descLeft} characters left.
        </p>
      </div>

      <fieldset>
        <legend className="field-label">What kind of idea is it?</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
              className={`rounded-full px-4 py-2 text-[15px] font-medium transition-colors ${
                category === c.id ? "bg-blue text-white" : "bg-white text-ink ring-1 ring-line hover:ring-blue"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-7 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="field-label">
            Your name <span className="font-normal text-mute">(optional)</span>
          </label>
          <input id="name" className="field" maxLength={LIMITS.nameMax} value={name} onChange={(e) => setName(e.target.value)} placeholder="Shown with your idea" autoComplete="given-name" />
          <p className="field-hint">Leave blank to stay anonymous.</p>
        </div>
        <div>
          <label htmlFor="email" className="field-label">
            Your email
          </label>
          <input id="email" type="email" className="field" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          <p className="field-hint">Private. Only used to tell you if you win.</p>
        </div>
      </div>

      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" ref={honey} tabIndex={-1} autoComplete="off" />
      </div>

      <div className="space-y-3 rounded-2xl bg-white p-5">
        <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-snug text-ink-2">
          <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[#0071e3]" checked={updates} onChange={(e) => setUpdates(e.target.checked)} />
          Email me each Monday with the winner and the new round.
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-snug text-ink-2">
          <input type="checkbox" required className="mt-0.5 h-5 w-5 shrink-0 accent-[#0071e3]" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>
            I agree to the{" "}
            <Link href="/rules" className="text-link hover:underline" target="_blank">
              rules
            </Link>
            , and I understand my idea will be public.
          </span>
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-[#fff2f2] px-4 py-3 text-[15px] text-[#b3261e]">
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary btn-lg w-full sm:w-auto" disabled={busy}>
        {busy ? "Sharing your idea…" : "Share my idea"}
      </button>
    </form>
  );
}
