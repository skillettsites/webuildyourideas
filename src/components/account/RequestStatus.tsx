import { STATUS_LABEL, type RequestStatus } from "@/lib/clients";

const STYLE: Record<RequestStatus, string> = {
  new: "bg-[#eef4ff] text-blue",
  in_progress: "bg-[#eef4ff] text-blue",
  needs_info: "bg-[#fff4e5] text-orange",
  done: "bg-green-soft text-green",
  declined: "bg-cloud text-mute",
};

export function RequestStatusPill({ status }: { status: RequestStatus }) {
  return (
    <span className={`pill !px-2.5 !py-0.5 !text-[12px] font-semibold ${STYLE[status]}`}>
      {status === "in_progress" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue" aria-hidden="true" />}
      {STATUS_LABEL[status]}
    </span>
  );
}
