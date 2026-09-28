"use client";

import { useMemo } from "react";
import { buildSite } from "@/lib/site/content";
import { renderSite } from "@/lib/site/render";
import { PhoneFrame, ScaledSite } from "./DeviceFrames";

// A real preview, as it looks on a phone. Fictional business.
export function PhoneSample() {
  const html = useMemo(() => {
    const s = buildSite({
      name: "Clear Maths",
      description: "Maths tutor for GCSE students in Reading. I was a teacher for ten years and I make maths make sense.",
    });
    return renderSite({ ...s, accent: "blue" });
  }, []);
  return (
    <PhoneFrame>
      <ScaledSite html={html} virtualWidth={390} virtualHeight={820} title="Example website on a phone" />
    </PhoneFrame>
  );
}
