import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { ReplyForm } from "@/components/account/ReplyForm";
import { RequestStatusPill } from "@/components/account/RequestStatus";
import { RequestThread } from "@/components/account/RequestThread";
import { currentClientId, getRequest } from "@/lib/clients";
import { SIZE_LABEL } from "@/lib/plans";
import { formatLondon } from "@/lib/rounds";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your request", robots: { index: false, follow: false } };

export default async function ClientRequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sent?: string; upload?: string }>;
}) {
  const clientId = await currentClientId();
  if (!clientId) redirect("/login");
  const { id } = await params;
  const { sent, upload } = await searchParams;
  const detail = await getRequest(clientId, id);
  if (!detail) notFound();
  const r = detail.request;

  return (
    <div className="bg-cloud px-5 pb-24 pt-10 md:pt-14">
      <div className="mx-auto max-w-[760px]">
        <Link href="/account" className="inline-flex items-center gap-1 text-[14px] text-link hover:underline">
          <ChevronLeft className="h-4 w-4" /> Your account
        </Link>

        {sent && (
          <div className="rise mt-5 rounded-[20px] bg-green-soft p-4 text-[15px] text-ink" role="status">
            <strong className="font-semibold">Request #{r.ref} sent.</strong> We’ll reply here and by email.
            {r.client.plan === "priority" ? " You’re on Priority, so it’s at the front of the queue." : ""}
          </div>
        )}
        {upload && (
          <div className="mt-3 rounded-[20px] bg-[#fff2f2] p-4 text-[14px] text-[#b3261e]" role="alert">
            {upload}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3 text-[14px] text-mute">
          <span className="font-semibold tabular-nums text-mute-2">#{r.ref}</span>
          <RequestStatusPill status={r.status} />
          {r.site && <span>{r.site.name}</span>}
          {r.status === "done" && r.size && <span>· {SIZE_LABEL[r.size]}</span>}
        </div>
        <h1 className="headline mt-3">{r.title}</h1>
        <p className="mt-2 text-[14px] text-mute">
          Sent {formatLondon(r.created_at, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          {r.completed_at ? ` · Done ${formatLondon(r.completed_at, { day: "numeric", month: "short" })}` : ""}
        </p>

        {r.status === "needs_info" && (
          <div className="mt-6 rounded-[20px] bg-[#fff4e5] p-4 text-[15px] text-ink">
            <strong className="font-semibold">We need your input.</strong> See our question below and reply when you can.
          </div>
        )}

        <div className="mt-8">
          <RequestThread detail={detail} viewer="client" attachmentBase="/api/account/attachments/" />
        </div>

        <div className="mt-8">
          <ReplyForm
            requestId={r.id}
            prompt={r.status === "done" ? "Something not quite right? Reply and we’ll reopen it." : "Add more detail, answer a question, or send another screenshot."}
          />
        </div>
      </div>
    </div>
  );
}
