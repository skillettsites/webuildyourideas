import Link from "next/link";
import type { Metadata } from "next";
import { PreviewStudio } from "@/components/PreviewStudio";
import { getPreview } from "@/lib/previews";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your website preview",
  robots: { index: false, follow: false },
};

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const preview = await getPreview(id).catch(() => null);
  if (!preview) {
    return (
      <div className="bg-cloud px-5 py-24">
        <div className="mx-auto max-w-[560px] rounded-[28px] bg-white p-10 text-center">
          <h1 className="title">We couldn’t find that preview.</h1>
          <p className="mt-3 text-mute">Check the link, or make a new one. It only takes a few seconds.</p>
          <Link href="/start" className="btn btn-primary mt-7">
            Build a new preview
          </Link>
        </div>
      </div>
    );
  }
  return (
    <PreviewStudio
      id={preview.id}
      stripeReady={Boolean((process.env.STRIPE_SECRET_KEY || "").trim())}
      initial={{
        content: preview.site,
        layout: preview.layout,
        accent: preview.accent,
        editsUsed: preview.edits_used,
        domain: preview.domain,
        status: preview.status,
        email: preview.email,
      }}
    />
  );
}
