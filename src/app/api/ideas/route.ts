import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { CATEGORIES, LIMITS, SITE_URL, categoryLabel } from "@/lib/config";
import { sendIdeaSubmitted } from "@/lib/email";
import { fail, ok, readJson, rpcFail } from "@/lib/http";
import { checkIdeaText, cleanText, validEmail } from "@/lib/moderation";
import { formatRoundClose, roundNumber } from "@/lib/rounds";
import { ipHash, signModeration } from "@/lib/security";
import { sbRpc } from "@/lib/supabase";
import { notifyOwner } from "@/lib/telegram";

type Body = {
  title?: string;
  description?: string;
  category?: string;
  name?: string;
  email?: string;
  updates?: boolean;
  agree?: boolean;
  website?: string; // honeypot
  started?: number;
};

type Created = { idea_id: string; idea_slug: string; token: string; closes_at: string }[];

export async function POST(req: Request) {
  const body = await readJson<Body>(req);
  const title = cleanText(body.title, LIMITS.titleMax + 20).replace(/\s+/g, " ");
  const description = cleanText(body.description, LIMITS.descriptionMax + 50);
  const name = cleanText(body.name, LIMITS.nameMax);
  const email = cleanText(body.email, 200).toLowerCase();
  const category = String(body.category || "");

  // Bots fill every field and submit instantly. Pretend it worked.
  if (body.website || (typeof body.started === "number" && Date.now() - body.started < 2500)) {
    return ok({ slug: null });
  }
  if (title.length < LIMITS.titleMin || title.length > LIMITS.titleMax) return fail("Please give your idea a short title (4 to 80 characters).");
  if (description.length < LIMITS.descriptionMin) return fail("Please describe your idea in at least a sentence or two.");
  if (description.length > LIMITS.descriptionMax) return fail(`Please keep the description under ${LIMITS.descriptionMax} characters.`);
  if (!CATEGORIES.some((c) => c.id === category)) return fail("Please choose a category.");
  if (!validEmail(email)) return fail("Please enter a valid email address, so we can tell you if you win.");
  if (!body.agree) return fail("Please tick the box to agree to the rules.");
  const problem = checkIdeaText(title, description);
  if (problem) return fail(problem);

  try {
    const rows = await sbRpc<Created>("wbyi_submit_idea", {
      p_title: title,
      p_description: description,
      p_category: category,
      p_author_name: name || null,
      p_email: email,
      p_ip_hash: ipHash(req.headers),
      p_updates: Boolean(body.updates),
    });
    const created = rows?.[0];
    if (!created) return fail("Something went wrong on our side. Please try again.", 500);

    revalidatePath("/ideas");
    revalidatePath("/");

    after(async () => {
      const closes = formatRoundClose(created.closes_at);
      await Promise.all([
        sendIdeaSubmitted({ to: email, name: name || null, title, slug: created.idea_slug, token: created.token, closes }),
        notifyOwner(
          [
            `💡 New idea (Round ${roundNumber(created.closes_at)})`,
            title,
            description.slice(0, 500),
            `${categoryLabel(category)} · ${name || "Anonymous"} · ${email}`,
          ],
          [
            { text: "View", url: `${SITE_URL}/ideas/${created.idea_slug}` },
            { text: "Hide it", url: `${SITE_URL}/api/admin/moderate?id=${created.idea_id}&a=hide&s=${signModeration(created.idea_id, "hide")}` },
          ],
        ),
      ]);
    });

    return ok({ slug: created.idea_slug });
  } catch (err) {
    return rpcFail(err);
  }
}
