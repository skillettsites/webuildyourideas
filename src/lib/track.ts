// Client-side analytics events. A no-op when GA is not loaded.
type Gtag = (cmd: "event", name: string, params?: Record<string, unknown>) => void;

export function track(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const g = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof g === "function") g("event", name, params);
}
