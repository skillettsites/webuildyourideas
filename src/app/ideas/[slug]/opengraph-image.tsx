import { ImageResponse } from "next/og";
import { categoryLabel } from "@/lib/config";
import { getIdeaBySlug } from "@/lib/ideas";
import { OG_SIZE, OgMark, ogFonts } from "@/lib/og";
import { roundNumber } from "@/lib/rounds";

export const alt = "An idea on We Build Your Ideas";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 300;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const idea = await getIdeaBySlug(slug);
  const title = idea?.title ?? "An idea worth building";
  const fontSize = title.length > 60 ? 64 : title.length > 36 ? 78 : 92;
  const status =
    idea?.status === "built" ? "Built" : idea?.status === "winner" || idea?.status === "building" ? `Round ${roundNumber(idea.round_end)} winner` : "Vote for this idea";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f5f5f7", fontFamily: "Inter", padding: 64 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <OgMark size={48} />
            <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: "#1d1d1f", letterSpacing: -0.5 }}>We Build Your Ideas</div>
          </div>
          {idea && (
            <div style={{ display: "flex", fontSize: 24, fontWeight: 500, color: "#6e6e73" }}>
              {`${categoryLabel(idea.category)} · Round ${roundNumber(idea.round_end)}`}
            </div>
          )}
        </div>
        <div style={{ display: "flex", background: "#ffffff", borderRadius: 40, padding: "52px 56px", alignItems: "center", gap: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ display: "flex", fontSize: 24, fontWeight: 700, color: idea?.status === "open" || !idea ? "#0071e3" : "#b64400" }}>{status}</div>
            <div style={{ display: "flex", marginTop: 14, fontSize, fontWeight: 700, color: "#1d1d1f", letterSpacing: -2.5, lineHeight: 1.05 }}>{title}</div>
          </div>
          {idea && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: 150,
                height: 170,
                borderRadius: 32,
                background: "#0071e3",
                color: "#ffffff",
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24">
                <path d="m6 15 6-6 6 6" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div style={{ display: "flex", fontSize: 56, fontWeight: 700, letterSpacing: -2 }}>{String(idea.score)}</div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", fontSize: 26, fontWeight: 500, color: "#6e6e73" }}>The top idea every week gets built, free. webuildyourideas.com</div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
