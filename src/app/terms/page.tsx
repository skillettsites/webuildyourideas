import Link from "next/link";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The terms for using We Build Your Ideas, making website previews and subscribing to a website plan.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service" updated="28 September 2026" intro="Plain-English terms for using the site and for our website plans.">
      <h2>1. Using the site</h2>
      <p>
        You can browse, vote, share ideas and make website previews for free. Please don’t misuse the site: no spam, no abuse, no attempts to break
        or overload it, and nothing illegal or harmful. The weekly build has its own <Link href="/rules">rules</Link>, which form part of these terms.
      </p>

      <h2>2. Free previews</h2>
      <p>
        A preview is a design suggestion made automatically from what you tell us. It isn’t published and isn’t visible to anyone without the link.
        Checking whether a web address is free doesn’t reserve it: a name is only yours once we have registered it for a live website.
      </p>

      <h2>3. Website plans</h2>
      <ul>
        <li>Plans are monthly subscriptions. Prices are shown on the <Link href="/pricing">pricing page</Link>.</li>
        <li>
          Each plan includes design, hosting, security and a standard .com or .co.uk address, plus a monthly allowance of updates. Unused allowance
          doesn’t roll over.
        </li>
        <li>We confirm the details of your site with you before we take the first payment.</li>
        <li>We aim to have your site live within two working days of agreeing the details. Some things, like moving an existing domain, take longer.</li>
      </ul>

      <h2>4. Your content</h2>
      <p>
        You’re responsible for the words, images and information you give us, and for having the right to use them. We may decline to publish
        anything unlawful or harmful. You keep all rights to your own content.
      </p>

      <h2>5. Domain names</h2>
      <p>
        We register your web address and manage it while you’re subscribed. If you cancel and want to keep the name, ask us and we’ll transfer it to
        you. Premium names that registries charge extra for are not included.
      </p>

      <h2>6. Cancelling</h2>
      <p>
        You can cancel any time. Your site stays live until the end of the month you’ve paid for. Under UK consumer law you can cancel within 14 days
        of signing up for a refund, less a fair amount for any work we’ve already done at your request.
      </p>

      <h2>7. Our responsibility</h2>
      <p>
        We work hard to keep sites online and secure, but we can’t promise the service will never be interrupted. We are not liable for indirect
        losses, such as lost profit. Nothing in these terms limits liability that can’t be limited by law.
      </p>

      <h2>8. Changes and law</h2>
      <p>
        We may update these terms and will tell subscribers about significant changes by email. These terms are governed by the law of England and
        Wales.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions? <Link href="/contact">Get in touch</Link>.
      </p>
    </LegalPage>
  );
}
