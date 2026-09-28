import Link from "next/link";
import { NewsletterForm } from "./NewsletterForm";
import { LogoMark } from "./Logo";

const COLS = [
  {
    title: "The weekly build",
    links: [
      { href: "/ideas", label: "This week’s ideas" },
      { href: "/ideas/submit", label: "Submit an idea" },
      { href: "/ideas/past", label: "Past rounds" },
      { href: "/built", label: "Built so far" },
      { href: "/rules", label: "Rules" },
    ],
  },
  {
    title: "Get a website",
    links: [
      { href: "/start", label: "Free preview" },
      { href: "/pricing", label: "Pricing" },
      { href: "/how-it-works", label: "How it works" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-cloud text-[12px] leading-[1.35] text-mute">
      <div className="mx-auto max-w-[1080px] px-5">
        <div className="grid gap-10 border-b hairline py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5 text-ink">
              <LogoMark size={24} />
              <span className="text-[15px] font-semibold tracking-[-0.02em]">We Build Your Ideas</span>
            </div>
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-mute">
              Get the weekly winner, and the new round, in your inbox every Monday.
            </p>
            <div className="mt-4">
              <NewsletterForm source="footer" />
            </div>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <h2 className="text-[12px] font-semibold text-ink">{col.title}</h2>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[13px] text-mute transition-colors hover:text-ink hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright © {new Date().getFullYear()} We Build Your Ideas. Made in the UK.</p>
          <p>
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <span className="mx-2 text-line">|</span>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <span className="mx-2 text-line">|</span>
            <Link href="/rules" className="hover:underline">
              Rules
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
