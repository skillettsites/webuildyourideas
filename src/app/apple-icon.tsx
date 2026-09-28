import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0a84ff 0%, #7d4cdb 55%, #e3246b 100%)" }}>
        <svg width="120" height="120" viewBox="0 0 40 40">
          <path d="M9 22 20 11l11 11" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 30h16" stroke="#fff" strokeOpacity="0.7" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
    ),
    size,
  );
}
