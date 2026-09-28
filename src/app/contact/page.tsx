import Link from "next/link";
import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about the weekly build, your website or anything else. Send us a message and a real person will reply.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="px-5 pb-24 pt-14 md:pt-20">
      <div className="mx-auto grid max-w-[1000px] gap-12 md:grid-cols-[1fr_1.3fr]">
        <div>
          <h1 className="display rise">Say hello.</h1>
          <p className="lede rise rise-1 mt-5">A real person reads every message.</p>
          <div className="rise rise-2 mt-10 space-y-6 text-[15px] leading-relaxed text-mute">
            <p>
              <strong className="block text-[17px] text-ink">Won a round?</strong>Reply to the email we sent you, or use this form, and we’ll plan
              your build together.
            </p>
            <p>
              <strong className="block text-[17px] text-ink">Want a website?</strong>The fastest way is to{" "}
              <Link href="/start" className="text-link hover:underline">
                make a free preview
              </Link>
              , then press Make it live.
            </p>
            <p>
              <strong className="block text-[17px] text-ink">Seen an idea that breaks the rules?</strong>Tell us which one and we’ll take a look.
            </p>
          </div>
        </div>
        <div className="rise rise-2 relative">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
