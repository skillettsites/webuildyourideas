"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { track } from "@/lib/track";
import { uploadFiles } from "@/lib/upload-client";
import { AttachPicker } from "./AttachPicker";

export function NewRequestForm({ sites }: { sites: { id: string; name: string }[] }) {
  const router = useRouter();
  const [siteId, setSiteId] = useState(sites[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy("Sending…");
    try {
      const res = await fetch("/api/account/requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ siteId, title, details }),
      });
      const data = (await res.json()) as { ok?: boolean; id?: string; error?: string };
      if (!res.ok || !data.ok || !data.id) throw new Error(data.error || "Something went wrong. Please try again.");
      let problems: string[] = [];
      if (files.length) {
        problems = await uploadFiles(data.id, files, undefined, (d, t) => setBusy(`Uploading ${d} of ${t}…`));
      }
      track("client_request_created", { files: files.length });
      router.push(`/account/requests/${data.id}?sent=1${problems.length ? `&upload=${encodeURIComponent(problems.join(" "))}` : ""}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy("");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {sites.length > 1 && (
        <div>
          <label htmlFor="site" className="field-label">
            Which website?
          </label>
          <select id="site" className="field" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="title" className="field-label">
          What do you need?
        </label>
        <input
          id="title"
          className="field"
          required
          minLength={3}
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="For example: show the pitches side by side on the match page"
        />
      </div>
      <div>
        <label htmlFor="details" className="field-label">
          Tell us more
        </label>
        <textarea
          id="details"
          className="field min-h-[180px] resize-y"
          maxLength={8000}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Which page it’s on, what should happen, and anything we should copy. The more detail, the quicker it’s done."
        />
      </div>
      <AttachPicker files={files} onChange={setFiles} disabled={Boolean(busy)} />
      {error && (
        <p role="alert" className="rounded-2xl bg-[#fff2f2] px-4 py-3 text-[15px] text-[#b3261e]">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary btn-lg w-full sm:w-auto" disabled={Boolean(busy) || title.trim().length < 3}>
        {busy || "Send request"}
      </button>
    </form>
  );
}
