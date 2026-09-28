"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/track";

const EXAMPLES = [
  { label: "Dog walker", name: "", text: "Small-group dog walks around Roundhay Park in Leeds, plus puppy visits and holiday cover." },
  { label: "Bakery", name: "", text: "A Saturday bakery stall in York. Sourdough, cinnamon buns and birthday cakes to order." },
  { label: "Plumber", name: "", text: "I’m a plumber based in Newcastle. Boilers, leaks and bathroom installs. Call 0191 498 0123." },
  { label: "Yoga teacher", name: "", text: "Yoga classes for beginners in Brighton, plus private sessions. Friendly, calm and no pressure." },
];

type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { resultIndex: number; results: { isFinal: boolean; 0: { transcript: string } }[] & { length: number } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

export function StartForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [canListen, setCanListen] = useState(false);
  const [listening, setListening] = useState(false);
  const rec = useRef<SpeechRec | null>(null);
  const base = useRef("");

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
    setCanListen(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  function toggleListen() {
    if (listening) {
      rec.current?.stop();
      return;
    }
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = "en-GB";
    r.continuous = true;
    r.interimResults = true;
    base.current = text ? `${text.trim()} ` : "";
    r.onresult = (e) => {
      let finalText = "";
      let interim = "";
      for (let i = 0; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interim += t;
      }
      setText(`${base.current}${finalText}${interim}`.slice(0, 2000));
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    rec.current = r;
    r.start();
    setListening(true);
    track("voice_input");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    rec.current?.stop();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, description: text }),
      });
      const data = (await res.json()) as { ok?: boolean; id?: string; error?: string };
      if (!res.ok || !data.ok || !data.id) throw new Error(data.error || "Something went wrong. Please try again.");
      track("preview_created");
      router.push(`/start/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card-white p-5 text-left sm:p-7">
      <label htmlFor="biz-name" className="field-label">
        Business or project name <span className="font-normal text-mute">(optional)</span>
      </label>
      <input id="biz-name" className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Bright Crumb" autoComplete="organization" />

      <div className="mt-6 flex items-end justify-between gap-3">
        <label htmlFor="biz-text" className="field-label !mb-2">
          Describe it like you would to a friend
        </label>
        {canListen && (
          <button
            type="button"
            onClick={toggleListen}
            className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
              listening ? "bg-[#ff3b30] text-white" : "bg-cloud text-ink hover:bg-[#e8e8ed]"
            }`}
            aria-pressed={listening}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
            {listening ? "Listening… tap to stop" : "Speak instead"}
          </button>
        )}
      </div>
      <textarea
        id="biz-text"
        className="field min-h-[150px] resize-y"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={2000}
        required
        placeholder="What you do, who it’s for, and where you are. Add a phone number or email if you like."
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[13px] text-mute">Try one:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            type="button"
            onClick={() => {
              setText(ex.text);
              setName(ex.name);
            }}
            className="rounded-full bg-cloud px-3 py-1 text-[13px] font-medium text-ink transition-colors hover:bg-[#e8e8ed]"
          >
            {ex.label}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-5 rounded-2xl bg-[#fff2f2] px-4 py-3 text-[15px] text-[#b3261e]">
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary btn-lg mt-7 w-full" disabled={busy || text.trim().length < 12}>
        {busy ? "Designing your website…" : "Build my free preview"}
      </button>
      <p className="mt-3 text-center text-[13px] text-mute">No card. No sign-up. Speech stays in your browser.</p>
    </form>
  );
}
