import Link from "next/link";
import type { Metadata } from "next";
import { sbRpc } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  let done = false;
  if (t && /^[a-f0-9]{36}$/.test(t)) {
    done = await sbRpc<boolean>("wbyi_unsubscribe", { p_token: t }).catch(() => false);
  }
  return (
    <div className="bg-cloud px-5 py-24">
      <div className="mx-auto max-w-[560px] rounded-[28px] bg-white p-10 text-center">
        <h1 className="title">{done ? "You’re unsubscribed." : "Already done."}</h1>
        <p className="mt-3 text-mute">
          {done ? "You won’t get the weekly email any more. You can join again from the bottom of any page." : "This address isn’t on the weekly email list."}
        </p>
        <Link href="/" className="btn btn-primary mt-7">
          Back to the site
        </Link>
      </div>
    </div>
  );
}
