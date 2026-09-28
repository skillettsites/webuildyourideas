import "server-only";

// Free availability checks over RDAP. 404 = not registered, 2xx = taken, anything else = unknown.
// Checked against live registries on 28 Sep 2026 (google.com 200, bbc.co.uk 200, random names 404).
// Availability here is a guide: a name is only ours once it is registered after payment.

export type DomainStatus = "available" | "taken" | "unknown";
export type DomainResult = { domain: string; status: DomainStatus };

export function toLabel(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/&/g, "and")
    .replace(/\.(com|co\.uk|uk|net|org)$/i, "")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

async function rdap(domain: string): Promise<DomainStatus> {
  const url = domain.endsWith(".co.uk")
    ? `https://rdap.nominet.uk/uk/domain/${encodeURIComponent(domain)}`
    : `https://rdap.verisign.com/com/v1/domain/${encodeURIComponent(domain)}`;
  try {
    const res = await fetch(url, { headers: { accept: "application/rdap+json" }, signal: AbortSignal.timeout(6000), cache: "no-store" });
    if (res.status === 404) return "available";
    if (res.status >= 200 && res.status < 300) return "taken";
    return "unknown";
  } catch {
    return "unknown";
  }
}

export async function checkDomains(name: string, place = ""): Promise<{ label: string; results: DomainResult[] }> {
  const label = toLabel(name);
  if (label.length < 2) return { label, results: [] };
  const primary = [`${label}.co.uk`, `${label}.com`];
  const placeLabel = toLabel(place);
  const alts = [placeLabel && !label.includes(placeLabel) ? `${label}${placeLabel}` : "", `${label}uk`, `get${label}`, `${label}hq`]
    .filter(Boolean)
    .slice(0, 3)
    .flatMap((l) => [`${l}.co.uk`, `${l}.com`]);
  const first = await Promise.all(primary.map(async (d) => ({ domain: d, status: await rdap(d) })));
  if (first.some((r) => r.status === "available")) return { label, results: first };
  const more = await Promise.all(alts.slice(0, 4).map(async (d) => ({ domain: d, status: await rdap(d) })));
  return { label, results: [...first, ...more] };
}
