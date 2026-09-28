import { ImageResponse } from "next/og";
import { OG_SIZE, OgMark, ogFonts } from "@/lib/og";

export const alt = "We Build Your Ideas. Your idea. Built.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(135deg, #ffffff 0%, #f3f6ff 45%, #fbf1ff 75%, #fff2f5 100%)", fontFamily: "Inter" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "64px 80px 0" }}>
          <OgMark size={56} />
          <div style={{ fontSize: 30, fontWeight: 700, color: "#1d1d1f", letterSpacing: -0.6 }}>We Build Your Ideas</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", padding: "70px 80px 0" }}>
          <div style={{ fontSize: 128, fontWeight: 700, color: "#1d1d1f", letterSpacing: -6, lineHeight: 1 }}>Your idea.</div>
          <div
            style={{
              fontSize: 128,
              fontWeight: 700,
              letterSpacing: -6,
              lineHeight: 1.05,
              backgroundImage: "linear-gradient(95deg, #0071e3 0%, #7d4cdb 48%, #e3246b 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Built.
          </div>
          <div style={{ marginTop: 30, fontSize: 32, fontWeight: 500, color: "#6e6e73", letterSpacing: -0.5 }}>
            Share an idea free. The top idea every week gets built.
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
