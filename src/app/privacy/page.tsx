import Link from "next/link";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What we collect, why, how long we keep it and your rights under UK data protection law.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      updated="28 September 2026"
      intro="We collect as little as we can, we never sell it, and you can ask us to delete it at any time."
    >
      <h2>Who we are</h2>
      <p>
        We Build Your Ideas (webuildyourideas.com) is a UK web studio. We are the controller of the personal data described here. You can reach us
        through our <Link href="/contact">contact page</Link>.
      </p>

      <h2>What we collect and why</h2>
      <ul>
        <li>
          <strong>When you share an idea:</strong> the idea itself, the name you choose to show (optional) and your email address. The idea and name
          are public. Your email is private and used to confirm your idea, tell you if you win, and send the weekly email if you ask for it.
        </li>
        <li>
          <strong>When you vote:</strong> a random identifier stored in a cookie on your device, and a one-way scrambled (hashed) version of your IP
          address. We use these only to make sure each person votes once per idea and to spot fake votes. We can’t turn the hash back into your IP
          address.
        </li>
        <li>
          <strong>When you make a website preview:</strong> the description and details you type, and the design choices you make. Your preview has
          a private link. If you speak your description, the speech is turned into text by your own browser; we never receive the audio.
        </li>
        <li>
          <strong>When you ask us to make a website live, or contact us:</strong> your name, email, the plan you chose and your message, so we can
          reply and set up your website.
        </li>
        <li>
          <strong>Payments:</strong> if you pay online, payment is handled by Stripe. We never see or store your card details.
        </li>
        <li>
          <strong>Analytics:</strong> we use Google Analytics to understand which pages are useful (for example pages visited and device type). It
          uses cookies. You can block these in your browser settings without affecting how the site works.
        </li>
      </ul>

      <h2>Our lawful bases</h2>
      <p>
        We use your data to run the weekly build and provide the service you ask for (contract and legitimate interests), to prevent abuse of the
        vote (legitimate interests), and to send the weekly email only if you opt in (consent). You can unsubscribe from any weekly email with one
        click.
      </p>

      <h2>Who we share it with</h2>
      <p>
        We use trusted providers to run the site: Vercel (hosting), Supabase (database), Resend (email), Stripe (payments), Google (analytics) and
        Cloudflare (domain names). They process data only on our instructions. Some are based outside the UK and use approved safeguards such as
        standard contractual clauses. We don’t sell your data or share it for advertising.
      </p>

      <h2>How long we keep it</h2>
      <ul>
        <li>Ideas stay on the site while the site runs, unless you remove them. Private emails linked to ideas are deleted on request.</li>
        <li>Voting records are kept for as long as the idea is on the site, so the count stays accurate.</li>
        <li>Previews that never go live are deleted after 12 months.</li>
        <li>Customer records are kept for as long as you’re a customer and then for six years, as UK tax law requires.</li>
      </ul>

      <h2>Your rights</h2>
      <p>
        You can ask to see, correct, delete or export your data, or object to how we use it. Just <Link href="/contact">contact us</Link> and we’ll
        reply within a month. If you’re unhappy with how we’ve handled your data you can complain to the Information Commissioner’s Office at ico.org.uk.
      </p>

      <h2>Cookies</h2>
      <p>
        We use one cookie of our own, to remember your votes, and Google Analytics cookies to measure use of the site. Stripe may set cookies during
        checkout.
      </p>
    </LegalPage>
  );
}
