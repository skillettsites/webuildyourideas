import Link from "next/link";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Rules of the weekly build",
  description: "How ideas are shared, how votes are counted, how the weekly winner is chosen and what the winner gets.",
  alternates: { canonical: "/rules" },
};

export default function RulesPage() {
  return (
    <LegalPage
      title="Rules of the weekly build"
      updated="30 September 2026"
      intro="Short version: share an idea, gather votes, and if yours has the most when voting closes on Sunday at 8pm, we build it for you, free."
    >
      <h2>1. Who can take part</h2>
      <p>
        Anyone aged 18 or over can share an idea. Anyone can vote. Taking part is free and there is nothing to buy. Members of the We Build Your
        Ideas team and their families can’t enter ideas of their own for the prize.
      </p>

      <h2>2. Rounds</h2>
      <p>
        Each round runs for a week and closes every Sunday at 8pm UK time. An idea takes part in the round that is open when it is shared. Round 1
        closes on Sunday 4 October 2026.
      </p>

      <h2>3. Sharing an idea</h2>
      <ul>
        <li>You can share up to three ideas in each round.</li>
        <li>You need to give a valid email address so we can contact you if you win. It is never shown on the site.</li>
        <li>Your idea must be your own, and must not copy an existing product, brand or someone else’s work.</li>
        <li>Ideas are public. Don’t share anything confidential, personal or that you would not want others to see.</li>
        <li>You can remove your idea at any time before it wins, using the private link in your confirmation email.</li>
      </ul>

      <h2>4. Voting</h2>
      <ul>
        <li>Each person gets one vote per idea, and can vote for as many ideas as they like, including their own.</li>
        <li>You can take a vote back until voting closes.</li>
        <li>Buying votes, using bots, running multiple accounts or any other attempt to game the vote is not allowed.</li>
        <li>We check votes for fraud and may remove any we believe are not genuine, or disqualify an idea that has benefited from them.</li>
      </ul>

      <h2>5. Ideas from TikTok</h2>
      <ul>
        <li>We also take ideas from the comments on our TikTok videos. We add the most-liked comments to the board, credited to the commenter’s TikTok username, with a link to the video.</li>
        <li>For those ideas, every like on the comment counts as one vote, added to any votes it gets here. We update like counts during the week and take a final count when voting closes.</li>
        <li>If a TikTok idea wins, we contact the commenter on TikTok. The same rules and prize apply.</li>
        <li>Likes bought, botted or gathered by any trick don’t count, and we may disqualify an idea that has used them.</li>
      </ul>

      <h2>6. Starter ideas</h2>
      <p>
        To get each round going, we may add a few ideas of our own. They are clearly marked “Starter idea”, start with no votes, and can win like any
        other idea. If one does, we build it and launch it for everyone to use.
      </p>

      <h2>7. Choosing the winner</h2>
      <p>
        When voting closes, the idea with the highest score wins. The score is its votes here plus, for ideas from TikTok, its TikTok likes. If two ideas tie, the one shared first wins. An idea needs a score of at least one to win.
        We may pass over an idea, and pick the next in line, if it:
      </p>
      <ul>
        <li>is illegal, harmful, hateful, adult, or involves gambling, weapons or medical, legal or financial advice;</li>
        <li>would break someone else’s rights, such as copyright or a trade mark;</li>
        <li>needs something we can’t provide, such as a native iPhone or Android app, hardware, a licence or regulated activity; or</li>
        <li>is too large to turn into a meaningful first version.</li>
      </ul>
      <p>We email the winner on Sunday evening and show the result on the site.</p>

      <h2>8. What the winner gets</h2>
      <ul>
        <li>A conversation with us to agree a focused first version of the idea.</li>
        <li>Design, build and launch of that first version on the web, free of charge.</li>
        <li>A standard .com or .co.uk domain and hosting for the first 12 months, paid for by us.</li>
        <li>Ownership of the finished site and its code, which we hand over to you once it is launched.</li>
        <li>A share of any profits it makes. Profits are split 50% to you, 25% to us and 25% to charity.</li>
      </ul>
      <p>
        The prize has no cash value and can’t be exchanged. If we don’t hear from the winner within 7 days of our email, we may pick the next idea in
        line instead.
      </p>

      <h2>9. Using your idea</h2>
      <p>
        By sharing an idea you give us permission to show it on this site and to talk about it, and about any build, in our own marketing. Winning
        builds carry a small “Built by We Build Your Ideas” credit. Ideas themselves can’t be owned, and other people may have had the same idea, so
        sharing one doesn’t stop anyone else, including us, from working on something similar.
      </p>

      <h2>10. Moderation</h2>
      <p>
        We may edit a title for clarity, or hide or remove any idea that breaks these rules, without notice. If you think we’ve got something wrong,{" "}
        <Link href="/contact">get in touch</Link>.
      </p>

      <h2>11. Changes</h2>
      <p>
        We may update these rules from time to time. Changes apply to rounds that start after the change is published. The version on this page is
        the one that applies.
      </p>
    </LegalPage>
  );
}
