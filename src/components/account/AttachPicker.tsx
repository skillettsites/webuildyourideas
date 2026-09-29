"use client";

import { useRef } from "react";
import { formatBytes } from "@/lib/upload-client";

const ACCEPT = "image/*,application/pdf,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,video/mp4,video/quicktime";

export function AttachPicker({ files, onChange, disabled = false }: { files: File[]; onChange: (f: File[]) => void; disabled?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div>
      <input
        ref={input}
        type="file"
        multiple
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          const picked = Array.from(e.target.files || []);
          onChange([...files, ...picked].slice(0, 10));
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => input.current?.click()}
        className="inline-flex items-center gap-2 rounded-full bg-cloud px-4 py-2 text-[14px] font-medium text-ink transition-colors hover:bg-[#e8e8ed]"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
        Add screenshots or files
      </button>
      {files.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 rounded-xl bg-cloud px-3 py-2 text-[14px]">
              <span className="min-w-0 truncate text-ink">{f.name}</span>
              <span className="flex shrink-0 items-center gap-3">
                <span className="text-[12px] text-mute">{formatBytes(f.size)}</span>
                <button type="button" onClick={() => onChange(files.filter((_, n) => n !== i))} className="text-[13px] text-link hover:underline" aria-label={`Remove ${f.name}`}>
                  Remove
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="field-hint">Screenshots, photos, PDFs, Word or Excel. Big photos are shrunk automatically; other files up to 4 MB.</p>
    </div>
  );
}
