"use client";

import { useMemo } from "react";
import { buildSite } from "@/lib/site/content";
import { renderSite } from "@/lib/site/render";
import { PhoneFrame, ScaledSite } from "./DeviceFrames";

// A real preview, as it looks on a phone. Fictional business.
export function PhoneSample() {
  const html = useMemo(() => {
    const s = buildSite({
      name: "",
      description: "Tidewell Cottage: a holiday cottage in Robin Hood's Bay that sleeps four, a short walk down to the beach. Wood burner, sea views and dogs welcome.",
    });
    return renderSite({ ...s, layout: "bold" });
  }, []);
  return (
    <PhoneFrame>
      <ScaledSite html={html} virtualWidth={390} virtualHeight={820} title="Example website on a phone" />
    </PhoneFrame>
  );
}
