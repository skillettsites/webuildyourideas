import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { RequestStatusPill } from "@/components/account/RequestStatus";
import { RequestThread } from "@/components/account/RequestThread";
import { STATUS_LABEL, getRequest, type RequestStatus } from "@/lib/clients";
import { SIZE_LABEL, SIZE_UNITS, planById, type RequestSize } from "@/lib/plans";
import { formatLondon } from "@/lib/rounds";
import { ADMIN_COOKIE, isAdminSession } from "@/lib/security";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Request", robots: { index: false, follow: false } };

export default async function AdminRequestPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  if (!isAdminSession((await cookies()).get(ADMIN_COOKIE)?.value)) redirect("/admin");
  const { id } = await params;
  const { saved } = await searchParams;
  const detail = await getRequest(null, id);
  if (!detail) notFound();
  const r = detail.request;
  const plan = planById(r.client.plan);

  return (
    <div className="bg-cloud px-5 pb-24 pt-10">
      <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <Link href="/admin#client-requests" className="text-[14px] text-link hover:underline">
            ← All requests
          </Link>
          {saved && <p className="mt-4 rounded-2xl bg-green-soft px-4 py-3 text-[14px] text-ink">Saved.</p>}
          <div className="mt-5 flex flex-wrap items-center gap-3 text-[14px] text-mute">
            <span className="font-semibold tabular-nums">#{r.ref}</span>
            <RequestStatusPill status={r.status} />
            <span>
              {r.client.name} · {plan?.name ?? r.client.plan} · {r.client.email}
            </span>
          </div>
          <h1 className="headline mt-3">{r.title}</h1>
          <p className="mt-2 text-[14px] text-mute">
            {r.site ? `${r.site.name}${r.site.repo ? ` · repo ${r.site.repo}` : ""}${r.site.url ? ` · ${r.site.url}` : ""} · ` : ""}
            Sent {formatLondon(r.created_at, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          </p>
          <div className="mt-8">
            <RequestThread detail={detail} viewer="team" attachmentBase="/api/admin/attachments/" />
          </div>
        </div>

        <aside className="lg:sticky lg:top-[68px] lg:self-start">
          <form action={`/api/admin/requests/${r.id}`} method="post" encType="multipart/form-data" className="space-y-4 rounded-[24px] bg-white p-5">
            <div>
              <label htmlFor="status" className="field-label">
                Status
              </label>
              <select id="status" name="status" defaultValue={r.status} className="field !py-2.5 !text-[15px]">
                {(Object.keys(STATUS_LABEL) as RequestStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="size" className="field-label">
                Size (counts towards their allowance when done)
              </label>
              <select id="size" name="size" defaultValue={r.size ?? ""} className="field !py-2.5 !text-[15px]">
                <option value="">Not sized yet</option>
                {(Object.keys(SIZE_LABEL) as RequestSize[]).map((s) => (
                  <option key={s} value={s}>
                    {SIZE_LABEL[s]} ({SIZE_UNITS[s]} {SIZE_UNITS[s] === 1 ? "unit" : "units"})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="message" className="field-label">
                Message to {r.client.name.split(" ")[0]}
              </label>
              <textarea id="message" name="message" className="field min-h-[140px] !text-[15px]" placeholder="Optional. Shown in their thread and emailed to them." />
            </div>
            <div>
              <label htmlFor="files" className="field-label">
                Attach files
              </label>
              <input id="files" name="files" type="file" multiple className="text-[14px]" />
            </div>
            <label className="flex items-center gap-2 text-[14px] text-ink-2">
              <input type="checkbox" name="notify" value="1" defaultChecked className="h-4 w-4 accent-[#0071e3]" />
              Email {r.client.name.split(" ")[0]} about this
            </label>
            <input type="hidden" name="notify" value="0" />
            <button className="btn btn-primary w-full">Save</button>
            <p className="text-[12px] leading-relaxed text-mute">
              Marking a request Done adds it to their Recent updates feed. Their allowance only counts Done requests with a size.
            </p>
          </form>
        </aside>
      </div>
    </div>
  );
}
