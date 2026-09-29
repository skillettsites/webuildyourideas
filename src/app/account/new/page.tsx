import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { NewRequestForm } from "@/components/account/NewRequestForm";
import { currentClientId, getClientHome } from "@/lib/clients";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Request a change", robots: { index: false, follow: false } };

export default async function NewRequestPage() {
  const clientId = await currentClientId();
  if (!clientId) redirect("/login");
  const home = await getClientHome(clientId);
  if (!home) redirect("/login?expired=1");
  return (
    <div className="bg-cloud px-5 pb-24 pt-10 md:pt-14">
      <div className="mx-auto max-w-[680px]">
        <Link href="/account" className="inline-flex items-center gap-1 text-[14px] text-link hover:underline">
          <ChevronLeft className="h-4 w-4" /> Your account
        </Link>
        <h1 className="display mt-4">Request a change.</h1>
        <p className="lede mt-4">
          {home.client.plan === "priority" ? "You’re on Priority, so this goes to the front of the queue. " : ""}
          Plain English is perfect. Screenshots help most of all.
        </p>
        <div className="mt-8 rounded-[28px] bg-white p-6 sm:p-8">
          <NewRequestForm sites={home.sites.map((s) => ({ id: s.id, name: s.name }))} />
        </div>
      </div>
    </div>
  );
}
