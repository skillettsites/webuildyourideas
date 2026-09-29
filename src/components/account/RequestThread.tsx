import type { RequestDetail } from "@/lib/clients";
import { formatLondon } from "@/lib/rounds";

type Attachment = RequestDetail["attachments"][number];

function formatBytes(n: number): string {
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function Files({ files, base, mine }: { files: Attachment[]; base: string; mine: boolean }) {
  if (!files.length) return null;
  const images = files.filter((f) => /^image\/(png|jpeg|webp|gif)$/.test(f.mime));
  const others = files.filter((f) => !images.includes(f));
  return (
    <div className={`mt-2 flex flex-col gap-2 ${mine ? "items-end" : "items-start"}`}>
      {images.length > 0 && (
        <div className={`flex flex-wrap gap-2 ${mine ? "justify-end" : ""}`}>
          {images.map((f) => (
            <a key={f.id} href={`${base}${f.id}`} target="_blank" rel="noopener" className="block overflow-hidden rounded-2xl ring-1 ring-black/[0.08]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${base}${f.id}`} alt={f.filename} className="h-32 w-auto max-w-[220px] object-cover" loading="lazy" />
            </a>
          ))}
        </div>
      )}
      {others.map((f) => (
        <a
          key={f.id}
          href={`${base}${f.id}`}
          target="_blank"
          rel="noopener"
          className="inline-flex max-w-full items-center gap-2 rounded-2xl bg-white px-3 py-2 text-[14px] text-ink ring-1 ring-black/[0.08] hover:bg-cloud"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-mute" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
          </svg>
          <span className="truncate">{f.filename}</span>
          <span className="shrink-0 text-[12px] text-mute">{formatBytes(f.bytes)}</span>
        </a>
      ))}
    </div>
  );
}

function Bubble({ who, when, body, mine, children }: { who: string; when: string; body: string; mine: boolean; children?: React.ReactNode }) {
  return (
    <div className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
      <p className="mb-1 px-1 text-[12px] text-mute">
        {who} · {formatLondon(when, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
      </p>
      {body && (
        <div
          className={`max-w-[85%] whitespace-pre-line rounded-[20px] px-4 py-2.5 text-[16px] leading-relaxed sm:max-w-[75%] ${
            mine ? "rounded-br-md bg-blue text-white" : "rounded-bl-md bg-[#e9e9eb] text-ink"
          }`}
        >
          {body}
        </div>
      )}
      {children}
    </div>
  );
}

// viewer = whose side this page is. Their own messages sit on the right in blue, like Messages.
export function RequestThread({ detail, viewer, attachmentBase }: { detail: RequestDetail; viewer: "client" | "team"; attachmentBase: string }) {
  const { request, messages, attachments } = detail;
  const clientName = request.client.name;
  const loose = attachments.filter((a) => !a.message_id);
  const who = (author: "client" | "team") => (author === "team" ? "We Build Your Ideas" : clientName);
  return (
    <div className="space-y-5">
      <Bubble who={who("client")} when={request.created_at} body={request.details || request.title} mine={viewer === "client"}>
        <Files files={loose.filter((a) => a.uploaded_by === "client")} base={attachmentBase} mine={viewer === "client"} />
      </Bubble>
      {messages.map((m) => (
        <Bubble key={m.id} who={who(m.author)} when={m.created_at} body={m.body} mine={m.author === viewer}>
          <Files files={attachments.filter((a) => a.message_id === m.id)} base={attachmentBase} mine={m.author === viewer} />
        </Bubble>
      ))}
      {loose.some((a) => a.uploaded_by === "team") && (
        <Bubble who={who("team")} when={loose.filter((a) => a.uploaded_by === "team")[0].created_at} body="" mine={viewer === "team"}>
          <Files files={loose.filter((a) => a.uploaded_by === "team")} base={attachmentBase} mine={viewer === "team"} />
        </Bubble>
      )}
    </div>
  );
}
