import type { Metadata } from "next";
import { SubmitIdeaForm } from "@/components/SubmitIdeaForm";
import { formatRoundClose, roundEndFor, roundNumber } from "@/lib/rounds";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Submit an idea",
  description: "Share your idea for a website, app or tool. It’s free. If it gets the most votes by Sunday at 8pm, we build it for you.",
  alternates: { canonical: "/ideas/submit" },
};

export default function SubmitPage() {
  const end = roundEndFor();
  return (
    <div className="bg-cloud px-5 pb-24 pt-14 md:pt-20">
      <div className="mx-auto max-w-[680px]">
        <p className="eyebrow rise text-orange">Round {roundNumber(end)}</p>
        <h1 className="display rise rise-1 mt-2">Share your idea.</h1>
        <p className="lede rise rise-2 mt-5">
          It takes about two minutes. If it has the most votes when voting closes on {formatRoundClose(end)} at 8pm, we build it for you. Free.
        </p>
        <div className="rise rise-3 mt-10">
          <SubmitIdeaForm />
        </div>
        <div className="mt-12 grid gap-4 text-[14px] leading-relaxed text-mute sm:grid-cols-3">
          <p>
            <strong className="block text-ink">Keep it simple.</strong>A clear title and two or three sentences work best.
          </p>
          <p>
            <strong className="block text-ink">Ideas are public.</strong>Please don’t share anything confidential.
          </p>
          <p>
            <strong className="block text-ink">Up to three a week.</strong>So every idea gets a fair look.
          </p>
        </div>
      </div>
    </div>
  );
}
