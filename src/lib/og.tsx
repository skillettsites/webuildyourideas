import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_URL } from "./config";

export const OG_SIZE = { width: 1200, height: 630 };

// Fonts live in /public/fonts. At build time they are read from disk; inside a serverless
// function the public folder is not on disk, so they are fetched from the site itself.
async function loadFont(file: string): Promise<ArrayBuffer | Buffer> {
  try {
    return await readFile(join(process.cwd(), "public/fonts", file));
  } catch {}
  const res = await fetch(`${SITE_URL}/fonts/${file}`, { cache: "force-cache" });
  if (!res.ok) throw new Error(`font ${file} ${res.status}`);
  return res.arrayBuffer();
}

export async function ogFonts() {
  const [bold, medium] = await Promise.all([loadFont("Inter-700.ttf"), loadFont("Inter-500.ttf")]);
  return [
    { name: "Inter", data: bold, style: "normal" as const, weight: 700 as const },
    { name: "Inter", data: medium, style: "normal" as const, weight: 500 as const },
  ];
}

export function OgMark({ size = 56 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.275,
        background: "linear-gradient(135deg, #0a84ff 0%, #7d4cdb 55%, #e3246b 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 40 40">
        <path d="M9 22 20 11l11 11" fill="none" stroke="#fff" strokeWidth="5.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 30h16" stroke="#fff" strokeOpacity="0.7" strokeWidth="4.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
