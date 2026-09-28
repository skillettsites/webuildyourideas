import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

const PRIVATE = ["/api/", "/admin", "/start/", "/ideas/manage/", "/unsubscribe"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      {
        userAgent: ["GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "Claude-User", "Claude-SearchBot", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended"],
        allow: "/",
        disallow: PRIVATE,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
