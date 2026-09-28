export type FaqItem = { q: string; a: string };

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-black/[0.08] border-y border-black/[0.08]">
      {items.map((item) => (
        <details key={item.q} className="faq group">
          <summary className="flex items-center justify-between gap-6 py-6 text-left">
            <span className="text-[19px] font-semibold tracking-[-0.02em] text-ink sm:text-[21px]">{item.q}</span>
            <span className="faq-icon grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black/[0.05] text-ink" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
          </summary>
          <p className="max-w-3xl pb-7 pr-12 text-[17px] leading-relaxed text-ink-2">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
}
