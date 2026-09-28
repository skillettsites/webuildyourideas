export function LegalPage({ title, updated, intro, children }: { title: string; updated: string; intro?: string; children: React.ReactNode }) {
  return (
    <div className="px-5 pb-24 pt-14 md:pt-20">
      <article className="mx-auto max-w-[720px]">
        <h1 className="headline">{title}</h1>
        <p className="mt-3 text-[14px] text-mute">Last updated {updated}</p>
        {intro && <p className="mt-8 text-[21px] leading-snug tracking-[-0.015em] text-ink">{intro}</p>}
        <div className="prose-apple mt-8 text-[17px] leading-relaxed">{children}</div>
      </article>
    </div>
  );
}
