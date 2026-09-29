"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { track } from "@/lib/track";

export function LoginForm({ notice }: { notice?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const codeInput = useRef<HTMLInputElement>(null);

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setStep("code");
      setTimeout(() => codeInput.current?.focus(), 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, code }) });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "That code didn’t work.");
      track("client_login");
      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code didn’t work.");
      setBusy(false);
    }
  }

  return (
    <div className="card-white p-6 sm:p-8">
      {notice && step === "email" && <p className="mb-5 rounded-2xl bg-cloud px-4 py-3 text-[15px] text-ink-2">{notice}</p>}
      {step === "email" ? (
        <form onSubmit={sendCode}>
          <label htmlFor="login-email" className="field-label">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            autoFocus
            className="field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@yourbusiness.co.uk"
          />
          {error && <p role="alert" className="mt-3 text-[14px] text-[#b3261e]">{error}</p>}
          <button type="submit" className="btn btn-primary mt-6 w-full" disabled={busy}>
            {busy ? "Sending…" : "Email me a sign-in code"}
          </button>
          <p className="mt-4 text-center text-[13px] text-mute">No password needed. We’ll email you a code.</p>
        </form>
      ) : (
        <form onSubmit={verify}>
          <p className="text-[15px] leading-relaxed text-ink-2">
            If <strong className="text-ink">{email}</strong> has an account, we’ve sent it a six-digit code. It works for 15 minutes.
          </p>
          <label htmlFor="login-code" className="field-label mt-6">
            Sign-in code
          </label>
          <input
            id="login-code"
            ref={codeInput}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={7}
            required
            className="field text-center !text-[28px] font-semibold tracking-[0.3em]"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
            placeholder="000000"
          />
          {error && <p role="alert" className="mt-3 text-[14px] text-[#b3261e]">{error}</p>}
          <button type="submit" className="btn btn-primary mt-6 w-full" disabled={busy || code.length !== 6}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <div className="mt-4 flex justify-between text-[13px]">
            <button type="button" className="text-link hover:underline" onClick={() => { setStep("email"); setCode(""); setError(""); }}>
              Use a different email
            </button>
            <button type="button" className="text-link hover:underline" onClick={() => sendCode()} disabled={busy}>
              Send a new code
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
