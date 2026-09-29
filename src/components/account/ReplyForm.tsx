"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { uploadFiles } from "@/lib/upload-client";
import { AttachPicker } from "./AttachPicker";

export function ReplyForm({ requestId, prompt }: { requestId: string; prompt: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy("Sending…");
    try {
      const text = body.trim() || (files.length ? `Added ${files.length} ${files.length === 1 ? "file" : "files"}.` : "");
      const res = await fetch(`/api/account/requests/${requestId}/reply`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const data = (await res.json()) as { ok?: boolean; messageId?: string; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "That didn’t send. Please try again.");
      if (files.length) {
        const problems = await uploadFiles(requestId, files, data.messageId, (d, t) => setBusy(`Uploading ${d} of ${t}…`));
        if (problems.length) setError(problems.join(" "));
      }
      setBody("");
      setFiles([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn’t send. Please try again.");
    } finally {
      setBusy("");
    }
  }

  return (
    <form onSubmit={send} className="rounded-[24px] bg-white p-4 sm:p-5">
      <label htmlFor="reply" className="sr-only">
        Your message
      </label>
      <textarea
        id="reply"
        className="field min-h-[110px] resize-y"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={prompt}
        maxLength={8000}
      />
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <AttachPicker files={files} onChange={setFiles} disabled={Boolean(busy)} />
        </div>
        <button type="submit" className="btn btn-primary btn-sm" disabled={Boolean(busy) || (!body.trim() && !files.length)}>
          {busy || "Send"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-[14px] text-[#b3261e]">
          {error}
        </p>
      )}
    </form>
  );
}
