// Renders a complete one-page website from SiteContent. Pure string output, no scripts,
// every piece of user text escaped. Used for free previews (inside a sandboxed iframe),
// the home page showcase, and as the starting point for a paid build.
import {
  ArrowRight, BedDouble, BookOpen, Briefcase, CakeSlice, CalendarCheck, CalendarDays, Camera, ChartLine, ChefHat,
  ClipboardList, Coffee, Croissant, Dog, Dumbbell, Flower2, Gift, GraduationCap, HandHeart, Hammer, Heart,
  HeartPulse, House, Image, KeyRound, Laptop, Leaf, Mail, MapPin, Megaphone, MessagesSquare, Music, Package,
  Palette, PawPrint, PenTool, Phone, Rocket, Scissors, ShieldCheck, ShoppingBag, Smartphone, Sparkles, Star,
  Ticket, Timer, TreePine, Users, Utensils, Wrench, Zap,
} from "lucide-static";
import { iconsFor, type AccentId, type IconName, type LayoutId, type SiteCategory, type SiteContent } from "./content";

export const LAYOUTS: { id: LayoutId; name: string; note: string }[] = [
  { id: "classic", name: "Classic", note: "Clear and trusted" },
  { id: "bold", name: "Bold", note: "Big and bright" },
  { id: "studio", name: "Studio", note: "Dark and visual" },
  { id: "minimal", name: "Minimal", note: "Calm and editorial" },
  { id: "event", name: "Event", note: "Loud and joyful" },
];

export const ACCENTS: { id: AccentId; name: string; hex: string; hex2: string }[] = [
  { id: "blue", name: "Blue", hex: "#0071e3", hex2: "#5e5ce6" },
  { id: "green", name: "Green", hex: "#248a3d", hex2: "#30b0c7" },
  { id: "teal", name: "Teal", hex: "#0e7c86", hex2: "#0071e3" },
  { id: "orange", name: "Orange", hex: "#c44d00", hex2: "#ff9f0a" },
  { id: "pink", name: "Pink", hex: "#d1195f", hex2: "#bf5af2" },
  { id: "purple", name: "Purple", hex: "#7d3cb5", hex2: "#ff375f" },
  { id: "graphite", name: "Graphite", hex: "#1d1d1f", hex2: "#86868b" },
];

const ICONS: Record<IconName | "arrow" | "phone" | "mail" | "pin", string> = {
  croissant: Croissant, "cake-slice": CakeSlice, star: Star, coffee: Coffee, utensils: Utensils,
  "chef-hat": ChefHat, "calendar-check": CalendarCheck, wrench: Wrench, hammer: Hammer, "shield-check": ShieldCheck,
  sparkles: Sparkles, house: House, "key-round": KeyRound, scissors: Scissors, gift: Gift, dumbbell: Dumbbell,
  heart: Heart, timer: Timer, camera: Camera, image: Image, "graduation-cap": GraduationCap, "book-open": BookOpen,
  laptop: Laptop, "paw-print": PawPrint, dog: Dog, "bed-double": BedDouble, "tree-pine": TreePine, "heart-pulse": HeartPulse, "clipboard-list": ClipboardList,
  briefcase: Briefcase, "chart-line": ChartLine, "messages-square": MessagesSquare, "shopping-bag": ShoppingBag,
  package: Package, rocket: Rocket, smartphone: Smartphone, zap: Zap, palette: Palette, "pen-tool": PenTool,
  "calendar-days": CalendarDays, ticket: Ticket, "map-pin": MapPin, users: Users, "hand-heart": HandHeart,
  megaphone: Megaphone, leaf: Leaf, "flower-2": Flower2, music: Music,
  arrow: ArrowRight, phone: Phone, mail: Mail, pin: MapPin,
};

function icon(name: keyof typeof ICONS): string {
  return (ICONS[name] || Star).replace(/\s*class="[^"]*"/, "").replace(/\n\s*/g, " ");
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

const SECTION_TITLE: Partial<Record<SiteCategory, string>> = {
  stay: "Your stay", bakery: "On the menu", cafe: "On the menu", food: "On the menu", shop: "Shop", tech: "Why you will love it",
  events: "The details", community: "Get involved", creative: "Work", photography: "Work",
};

const CTA_LINE: Partial<Record<SiteCategory, string>> = {
  trades: "Get a free quote today.", cleaning: "Let us take care of it.", beauty: "Book your next appointment.",
  fitness: "Your first session starts here.", photography: "Let’s make something lovely.", tutoring: "Book a first lesson.",
  pets: "Your dog will thank you.", health: "Book an appointment.", professional: "Let’s talk.",
  stay: "We would love to welcome you.", bakery: "Hungry yet?", cafe: "Come in and stay a while.", food: "Hungry yet?", shop: "Find something you love.",
  tech: "Be first in line.", creative: "Let’s work together.", events: "See you there.", community: "Come and join us.",
};

export type RenderInput = {
  content: SiteContent;
  layout: LayoutId;
  accent: AccentId;
  domain?: string;
};

type Ctx = {
  c: { [K in keyof SiteContent]: SiteContent[K] extends string ? string : SiteContent[K] };
  services: string[];
  icons: IconName[];
  a: { hex: string; hex2: string };
  year: number;
  sectionTitle: string;
  ctaLine: string;
  contactHref: string;
  contactIcon: "phone" | "mail";
  initial: string;
};

function context(input: RenderInput): Ctx {
  const raw = input.content;
  const c = {
    brand: escapeHtml(raw.brand || "Your business"),
    tagline: escapeHtml(raw.tagline || ""),
    intro: escapeHtml(raw.intro || ""),
    about: escapeHtml(raw.about || ""),
    services: raw.services.map(escapeHtml),
    cta: escapeHtml(raw.cta || "Get in touch"),
    contact: escapeHtml(raw.contact || ""),
    place: escapeHtml(raw.place || ""),
    category: raw.category,
  };
  const accent = ACCENTS.find((x) => x.id === input.accent) ?? ACCENTS[0];
  const isMail = raw.contact.includes("@");
  return {
    c,
    services: c.services.length ? c.services : ["Services", "About", "Contact"],
    icons: iconsFor(raw.category),
    a: accent,
    year: new Date().getFullYear(),
    sectionTitle: SECTION_TITLE[raw.category] ?? "Services",
    ctaLine: CTA_LINE[raw.category] ?? "Ready when you are.",
    contactHref: "#contact",
    contactIcon: isMail ? "mail" : "phone",
    initial: escapeHtml((raw.brand || "Y").trim().charAt(0).toUpperCase()),
  };
}

const BASE_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Inter,Roboto,"Helvetica Neue",Arial,sans-serif;color:#1d1d1f;background:#fff;line-height:1.5;-webkit-font-smoothing:antialiased;font-size:17px}
a{color:inherit;text-decoration:none}
svg{display:block}
.wrap{max-width:1120px;margin:0 auto;padding:0 28px}
.btn{display:inline-flex;align-items:center;gap:8px;padding:13px 24px;border-radius:999px;font-weight:600;font-size:16px;background:var(--a);color:#fff;white-space:nowrap}
.btn svg{width:18px;height:18px}
.btn.sm{padding:9px 18px;font-size:14px}
.btn.ghost{background:transparent;color:var(--a);box-shadow:inset 0 0 0 1.5px var(--a)}
.btn.light{background:#fff;color:var(--a)}
.ic svg{width:24px;height:24px}
h1,h2,h3{letter-spacing:-.025em;line-height:1.08}
@media (max-width:760px){.wrap{padding:0 20px}.hide-sm{display:none!important}}
`;

function head(title: string, css: string, a: { hex: string; hex2: string }): string {
  return `<!DOCTYPE html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title}</title><style>:root{--a:${a.hex};--a2:${a.hex2};--soft:color-mix(in srgb,var(--a) 9%,#fff);--soft2:color-mix(in srgb,var(--a2) 12%,#fff)}${BASE_CSS}${css}</style></head>`;
}

// ---------------------------------------------------------------------------
// Classic: trades, pets, beauty, cleaning. Split hero, service cards, accent band.
// ---------------------------------------------------------------------------
function classic(x: Ctx): string {
  const { c } = x;
  const css = `
.top{position:sticky;top:0;background:rgba(255,255,255,.86);backdrop-filter:saturate(180%) blur(16px);border-bottom:1px solid rgba(0,0,0,.07);z-index:5}
.bar{display:flex;align-items:center;justify-content:space-between;height:68px;gap:20px}
.logo{display:flex;align-items:center;gap:10px;font-weight:700;font-size:18px;letter-spacing:-.02em}
.mark{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,var(--a),var(--a2));color:#fff;display:grid;place-items:center;font-size:16px}
nav{display:flex;gap:28px;font-size:15px;color:#424245}
.hero{padding:88px 0 96px;background:linear-gradient(180deg,var(--soft) 0%,#fff 100%)}
.grid{display:grid;grid-template-columns:1.1fr .9fr;gap:56px;align-items:center}
.eyebrow{display:inline-flex;align-items:center;gap:6px;font-size:14px;font-weight:600;color:var(--a);background:#fff;border-radius:999px;padding:7px 14px;box-shadow:0 1px 2px rgba(0,0,0,.06)}
.eyebrow svg{width:15px;height:15px}
h1{font-size:clamp(40px,5.4vw,64px);font-weight:800;margin:22px 0 18px}
.lead{font-size:20px;color:#424245;max-width:34em}
.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}
.art{position:relative;aspect-ratio:1/1;border-radius:32px;background:radial-gradient(circle at 25% 20%,color-mix(in srgb,var(--a2) 55%,#fff) 0,transparent 55%),radial-gradient(circle at 80% 85%,var(--a) 0,transparent 60%),linear-gradient(135deg,var(--a),var(--a2));box-shadow:0 30px 60px -20px color-mix(in srgb,var(--a) 45%,transparent);overflow:hidden}
.art .big{position:absolute;inset:0;display:grid;place-items:center;color:rgba(255,255,255,.92)}
.art .big svg{width:34%;height:34%;stroke-width:1.4}
.chip{position:absolute;display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.94);backdrop-filter:blur(10px);border-radius:18px;padding:14px 18px;font-weight:600;font-size:15px;box-shadow:0 12px 30px -10px rgba(0,0,0,.25)}
.chip span{color:var(--a)}
.chip svg{width:20px;height:20px}
.chip.c1{left:7%;bottom:9%}.chip.c2{right:7%;top:9%}
.services{padding:104px 0}
.head{text-align:center;max-width:640px;margin:0 auto 52px}
.head h2{font-size:clamp(32px,4vw,46px);font-weight:800}
.head p{color:#6e6e73;font-size:19px;margin-top:12px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px}
.svc{background:#f5f5f7;border-radius:24px;padding:30px 26px 34px}
.svc .ic{width:52px;height:52px;border-radius:15px;background:#fff;color:var(--a);display:grid;place-items:center;margin-bottom:22px;box-shadow:0 1px 2px rgba(0,0,0,.05)}
.svc h3{font-size:21px;font-weight:700}
.about{padding:0 0 104px}
.about .box{display:grid;grid-template-columns:.8fr 1.2fr;gap:56px;align-items:start;border-top:1px solid #e5e5ea;padding-top:64px}
.about h2{font-size:clamp(30px,3.6vw,42px);font-weight:800}
.about p{font-size:19px;color:#424245}
.band{background:linear-gradient(135deg,var(--a),var(--a2));color:#fff;padding:88px 0;text-align:center}
.band h2{font-size:clamp(34px,4.4vw,52px);font-weight:800}
.band p{opacity:.9;font-size:19px;margin:14px 0 30px}
footer{padding:28px 0;font-size:14px;color:#86868b;text-align:center}
@media (max-width:860px){.grid,.about .box{grid-template-columns:1fr;gap:40px}.hero{padding:56px 0 64px}.art{max-width:440px;width:100%;margin:0 auto}nav{display:none}}
`;
  const cards = x.services
    .map((s, i) => `<div class="svc"><div class="ic">${icon(x.icons[i % x.icons.length])}</div><h3>${s}</h3></div>`)
    .join("");
  return `${head(c.brand, css, x.a)}<body>
<header class="top"><div class="wrap bar"><a class="logo" href="#"><span class="mark">${x.initial}</span>${c.brand}</a><nav><a href="#services">${x.sectionTitle}</a><a href="#about">About</a><a href="#contact">Contact</a></nav><a class="btn sm hide-sm" href="#contact">${c.cta}</a></div></header>
<section class="hero"><div class="wrap grid"><div>${c.place ? `<span class="eyebrow">${icon("pin")}${c.place}</span>` : ""}<h1>${c.tagline}</h1><p class="lead">${c.intro}</p><div class="actions"><a class="btn" href="#contact">${c.cta} ${icon("arrow")}</a>${c.contact ? `<a class="btn ghost" href="#contact">${icon(x.contactIcon)}${c.contact}</a>` : ""}</div></div>
<div class="art" aria-hidden="true"><div class="big">${icon(x.icons[0])}</div><div class="chip c2"><span>${icon(x.icons[1] ?? x.icons[0])}</span>${x.services[0]}</div><div class="chip c1"><span>${icon(x.icons[2] ?? x.icons[0])}</span>${x.services[1] ?? x.services[0]}</div></div></div></section>
<section id="services" class="services"><div class="wrap"><div class="head"><h2>${x.sectionTitle}</h2><p>${c.tagline}.</p></div><div class="cards">${cards}</div></div></section>
<section id="about" class="about"><div class="wrap"><div class="box"><h2>About ${c.brand}</h2><p>${c.about}</p></div></div></section>
<section id="contact" class="band"><div class="wrap"><h2>${x.ctaLine}</h2><p>${c.contact || (c.place ? `Serving ${c.place} and nearby.` : "Get in touch and we will get back to you.")}</p><a class="btn light" href="#contact">${c.cta} ${icon("arrow")}</a></div></section>
<footer><div class="wrap">© ${x.year} ${c.brand}${c.place ? ` · ${c.place}` : ""}</div></footer>
</body></html>`;
}

// ---------------------------------------------------------------------------
// Bold: food, shops, fitness, apps. Centred giant headline on a colour wash.
// ---------------------------------------------------------------------------
function bold(x: Ctx): string {
  const { c } = x;
  const css = `
body{background:#fbfbfd}
.top{position:absolute;left:0;right:0;top:0;z-index:5}
.bar{display:flex;align-items:center;justify-content:space-between;height:76px}
.logo{font-weight:800;font-size:20px;letter-spacing:-.03em}
nav{display:flex;gap:26px;font-size:15px;font-weight:500;color:#424245}
.hero{position:relative;overflow:hidden;padding:168px 0 120px;text-align:center;background:radial-gradient(60% 55% at 20% 20%,var(--soft2) 0,transparent 70%),radial-gradient(55% 60% at 85% 30%,var(--soft) 0,transparent 70%),#fbfbfd}
.hero:before{content:"";position:absolute;width:760px;height:460px;left:50%;top:22%;transform:translateX(-50%);background:radial-gradient(closest-side,color-mix(in srgb,var(--a) 22%,transparent),transparent);filter:blur(24px)}
.hero .wrap{position:relative}
.kicker{display:inline-block;font-weight:700;font-size:15px;letter-spacing:.02em;color:var(--a);margin-bottom:18px}
h1{font-size:clamp(46px,8vw,104px);font-weight:900;letter-spacing:-.045em;line-height:.98;max-width:12em;margin:0 auto}
h1 em{font-style:normal;background:linear-gradient(90deg,var(--a),var(--a2));-webkit-background-clip:text;background-clip:text;color:transparent}
.lead{font-size:clamp(19px,2vw,23px);color:#424245;max-width:32em;margin:26px auto 0}
.actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:34px}
.pills{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:44px}
.pill{display:flex;align-items:center;gap:8px;background:#fff;border-radius:999px;padding:10px 16px;font-size:15px;font-weight:600;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.pill svg{width:17px;height:17px;color:var(--a)}
.menu{padding:110px 0}
.menu h2{font-size:clamp(34px,4.6vw,56px);font-weight:900;letter-spacing:-.04em;text-align:center;margin-bottom:52px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:20px}
.card{border-radius:28px;overflow:hidden;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.card .pic{height:190px;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,var(--a),var(--a2))}
.card:nth-child(2) .pic{background:linear-gradient(135deg,var(--a2),var(--a))}
.card:nth-child(3) .pic{background:linear-gradient(200deg,var(--a),color-mix(in srgb,var(--a2) 60%,#000))}
.card:nth-child(4) .pic{background:linear-gradient(45deg,color-mix(in srgb,var(--a) 70%,#000),var(--a2))}
.card .pic svg{width:64px;height:64px;stroke-width:1.5}
.card h3{font-size:22px;font-weight:800;padding:22px 24px 26px}
.story{padding:0 0 110px}
.story .box{background:#fff;border-radius:36px;padding:72px;display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;box-shadow:0 1px 3px rgba(0,0,0,.05)}
.story h2{font-size:clamp(32px,4vw,48px);font-weight:900;letter-spacing:-.04em}
.story p{font-size:19px;color:#424245}
.band{background:#111;color:#fff;padding:100px 0;text-align:center}
.band h2{font-size:clamp(38px,5.4vw,68px);font-weight:900;letter-spacing:-.045em}
.band p{color:#a1a1a6;font-size:19px;margin:16px 0 34px}
footer{background:#111;color:#6e6e73;font-size:14px;text-align:center;padding:0 0 40px}
@media (max-width:860px){nav{display:none}.hero{padding:128px 0 88px}.story .box{grid-template-columns:1fr;padding:40px 28px;gap:24px}}
`;
  const words = c.tagline.split(" ");
  const tag = words.length > 2 ? `${words.slice(0, -1).join(" ")} <em>${words[words.length - 1]}</em>` : `<em>${c.tagline}</em>`;
  const pills = x.services.slice(0, 3).map((s, i) => `<span class="pill">${icon(x.icons[i % x.icons.length])}${s}</span>`).join("");
  const cards = x.services
    .map((s, i) => `<div class="card"><div class="pic">${icon(x.icons[i % x.icons.length])}</div><h3>${s}</h3></div>`)
    .join("");
  return `${head(c.brand, css, x.a)}<body>
<header class="top"><div class="wrap bar"><a class="logo" href="#">${c.brand}</a><nav><a href="#menu">${x.sectionTitle}</a><a href="#story">About</a><a href="#contact">Contact</a></nav><a class="btn sm hide-sm" href="#contact">${c.cta}</a></div></header>
<section class="hero"><div class="wrap"><span class="kicker">${c.brand}${c.place ? ` · ${c.place}` : ""}</span><h1>${tag}</h1><p class="lead">${c.intro}</p><div class="actions"><a class="btn" href="#contact">${c.cta} ${icon("arrow")}</a>${c.contact ? `<a class="btn ghost" href="#contact">${c.contact}</a>` : ""}</div><div class="pills">${pills}</div></div></section>
<section id="menu" class="menu"><div class="wrap"><h2>${x.sectionTitle}</h2><div class="cards">${cards}</div></div></section>
<section id="story" class="story"><div class="wrap"><div class="box"><h2>The story of ${c.brand}.</h2><p>${c.about}</p></div></div></section>
<section id="contact" class="band"><div class="wrap"><h2>${x.ctaLine}</h2><p>${c.contact || (c.place ? `Find us in ${c.place}.` : "We would love to hear from you.")}</p><a class="btn" href="#contact">${c.cta} ${icon("arrow")}</a></div></section>
<footer><div class="wrap">© ${x.year} ${c.brand}</div></footer>
</body></html>`;
}

// ---------------------------------------------------------------------------
// Studio: photography, art, music. Dark, big type, a wall of colour tiles.
// ---------------------------------------------------------------------------
function studio(x: Ctx): string {
  const { c } = x;
  const css = `
body{background:#0b0b0c;color:#f5f5f7}
.top .bar{display:flex;align-items:center;justify-content:space-between;height:80px}
.logo{font-weight:700;font-size:15px;letter-spacing:.22em;text-transform:uppercase}
nav{display:flex;gap:28px;font-size:15px;color:#a1a1a6}
.hero{padding:96px 0 72px}
.kicker{font-size:15px;color:#a1a1a6;letter-spacing:.02em}
h1{font-size:clamp(48px,8.4vw,120px);font-weight:800;letter-spacing:-.05em;line-height:.95;margin:18px 0 26px;max-width:11em}
.lead{font-size:clamp(19px,2vw,24px);color:#a1a1a6;max-width:30em}
.btn{background:#f5f5f7;color:#0b0b0c}
.actions{margin-top:34px;display:flex;gap:12px;flex-wrap:wrap}
.btn.ghost{background:transparent;color:#f5f5f7;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.35)}
.wall{display:grid;grid-template-columns:repeat(6,1fr);grid-auto-rows:150px;gap:14px;padding:24px 0 110px}
.tile{border-radius:22px;position:relative;overflow:hidden;background:linear-gradient(160deg,color-mix(in srgb,var(--a) 70%,#fff),var(--a2))}
.tile:after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 30% 25%,rgba(255,255,255,.35),transparent 55%)}
.tile span{position:absolute;left:18px;bottom:16px;z-index:1;font-weight:600;font-size:15px;color:#fff;text-shadow:0 1px 8px rgba(0,0,0,.35)}
.t1{grid-column:span 4;grid-row:span 3}.t2{grid-column:span 2;grid-row:span 3;background:linear-gradient(200deg,var(--a2),color-mix(in srgb,var(--a) 50%,#000))}
.t3{grid-column:span 2;grid-row:span 2;background:linear-gradient(120deg,color-mix(in srgb,var(--a2) 60%,#fff),color-mix(in srgb,var(--a) 80%,#000))}
.t4{grid-column:span 2;grid-row:span 2;background:linear-gradient(30deg,var(--a),color-mix(in srgb,var(--a2) 70%,#fff))}
.t5{grid-column:span 2;grid-row:span 2;background:linear-gradient(90deg,color-mix(in srgb,var(--a) 40%,#000),var(--a2))}
.t6{grid-column:span 3;grid-row:span 2;background:linear-gradient(10deg,var(--a2),color-mix(in srgb,var(--a) 60%,#fff))}
.t7{grid-column:span 3;grid-row:span 2;background:linear-gradient(250deg,color-mix(in srgb,var(--a) 85%,#fff),color-mix(in srgb,var(--a2) 40%,#000))}
.about{border-top:1px solid #2c2c2e;padding:88px 0;display:grid;grid-template-columns:1fr 1.3fr;gap:56px}
.about h2{font-size:clamp(30px,3.8vw,44px);font-weight:800}
.about p{font-size:19px;color:#a1a1a6}
.list{margin-top:26px;display:flex;flex-wrap:wrap;gap:10px}
.list span{border:1px solid #3a3a3c;border-radius:999px;padding:8px 15px;font-size:15px;color:#f5f5f7}
.contact{padding:96px 0 120px;border-top:1px solid #2c2c2e}
.contact h2{font-size:clamp(44px,7vw,96px);font-weight:800;letter-spacing:-.05em}
.contact p{color:#a1a1a6;font-size:20px;margin:18px 0 32px}
footer{border-top:1px solid #2c2c2e;padding:28px 0;color:#6e6e73;font-size:14px}
@media (max-width:860px){nav{display:none}.wall{grid-template-columns:repeat(2,1fr);grid-auto-rows:130px}.wall .tile{grid-column:span 1!important;grid-row:span 2!important}.wall .t1{grid-column:span 2!important}.about{grid-template-columns:1fr;gap:20px}}
`;
  const labels = [...x.services, ...x.services, ...x.services];
  const tiles = [1, 2, 3, 4, 5, 6, 7].map((n, i) => `<div class="tile t${n}"><span>${labels[i]}</span></div>`).join("");
  return `${head(c.brand, css, x.a)}<body>
<header class="top"><div class="wrap bar"><a class="logo" href="#">${c.brand}</a><nav><a href="#work">${x.sectionTitle}</a><a href="#about">About</a><a href="#contact">Contact</a></nav></div></header>
<section class="hero"><div class="wrap"><p class="kicker">${c.tagline}</p><h1>${c.brand}</h1><p class="lead">${c.intro}</p><div class="actions"><a class="btn" href="#contact">${c.cta} ${icon("arrow")}</a><a class="btn ghost" href="#work">See the work</a></div></div></section>
<section id="work"><div class="wrap wall">${tiles}</div></section>
<section id="about"><div class="wrap about"><h2>About</h2><div><p>${c.about}</p><div class="list">${x.services.map((s) => `<span>${s}</span>`).join("")}</div></div></div></section>
<section id="contact"><div class="wrap contact"><h2>Say hello.</h2><p>${c.contact || x.ctaLine}</p><a class="btn" href="#contact">${c.cta} ${icon("arrow")}</a></div></section>
<footer><div class="wrap">© ${x.year} ${c.brand}${c.place ? ` · ${c.place}` : ""}</div></footer>
</body></html>`;
}

// ---------------------------------------------------------------------------
// Minimal: professionals, tutors, clinics. Editorial serif, lots of air.
// ---------------------------------------------------------------------------
function minimal(x: Ctx): string {
  const { c } = x;
  const css = `
.serif{font-family:"New York","Iowan Old Style","Palatino Linotype",Palatino,Georgia,"Times New Roman",serif}
.top .bar{display:flex;align-items:center;justify-content:space-between;height:84px;border-bottom:1px solid #e8e8ed}
.logo{font-size:22px;font-weight:600;letter-spacing:-.01em}
nav{display:flex;gap:28px;font-size:15px;color:#6e6e73}
.col{max-width:820px}
.hero{padding:120px 0 96px}
.kicker{display:flex;align-items:center;gap:10px;font-size:15px;font-weight:600;color:var(--a)}
.kicker:before{content:"";width:28px;height:2px;background:var(--a)}
h1{font-size:clamp(44px,6.6vw,84px);font-weight:500;letter-spacing:-.03em;line-height:1.02;margin:26px 0 28px}
.lead{font-size:clamp(19px,2vw,23px);color:#424245;max-width:34em}
.actions{display:flex;align-items:center;gap:22px;flex-wrap:wrap;margin-top:38px}
.link{color:var(--a);font-weight:600;border-bottom:1.5px solid color-mix(in srgb,var(--a) 35%,transparent);padding-bottom:2px}
.svcs{padding:40px 0 100px}
.label{font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#86868b;margin-bottom:22px}
.row{display:grid;grid-template-columns:80px 1fr auto;align-items:center;gap:20px;padding:28px 0;border-top:1px solid #e8e8ed}
.row:last-child{border-bottom:1px solid #e8e8ed}
.row .n{color:var(--a);font-weight:600}
.row h3{font-size:clamp(24px,2.6vw,32px);font-weight:500;letter-spacing:-.02em}
.row .ic{color:#c7c7cc}
.about{padding:0 0 110px}
.about .serif{font-size:clamp(20px,2.2vw,26px);line-height:1.45;letter-spacing:-.01em;color:#1d1d1f}
.contact{background:var(--soft);padding:100px 0}
.contact h2{font-size:clamp(44px,6vw,76px);font-weight:500;letter-spacing:-.03em}
.contact p{font-size:20px;color:#424245;margin:16px 0 34px}
footer{padding:30px 0;font-size:14px;color:#86868b}
@media (max-width:860px){nav{display:none}.hero{padding:72px 0 64px}.row{grid-template-columns:48px 1fr}.row .ic{display:none}}
`;
  const rows = x.services
    .map((s, i) => `<div class="row"><span class="n">0${i + 1}</span><h3 class="serif">${s}</h3><span class="ic">${icon(x.icons[i % x.icons.length])}</span></div>`)
    .join("");
  return `${head(c.brand, css, x.a)}<body>
<header class="top"><div class="wrap"><div class="bar"><a class="logo serif" href="#">${c.brand}</a><nav><a href="#services">${x.sectionTitle}</a><a href="#about">About</a><a href="#contact">Contact</a></nav></div></div></header>
<section class="hero"><div class="wrap col"><p class="kicker">${c.place ? `${c.place}` : c.brand}</p><h1 class="serif">${c.tagline}</h1><p class="lead">${c.intro}</p><div class="actions"><a class="btn" href="#contact">${c.cta} ${icon("arrow")}</a>${c.contact ? `<a class="link" href="#contact">${c.contact}</a>` : ""}</div></div></section>
<section id="services" class="svcs"><div class="wrap col"><p class="label">${x.sectionTitle}</p>${rows}</div></section>
<section id="about" class="about"><div class="wrap col"><p class="label">About</p><p class="serif">${c.about}</p></div></section>
<section id="contact" class="contact"><div class="wrap col"><h2 class="serif">${x.ctaLine}</h2><p>${c.contact || "Send a message and we will reply as soon as we can."}</p><a class="btn" href="#contact">${c.cta} ${icon("arrow")}</a></div></section>
<footer><div class="wrap">© ${x.year} ${c.brand}${c.place ? ` · ${c.place}` : ""}</div></footer>
</body></html>`;
}

// ---------------------------------------------------------------------------
// Event: events, clubs, causes. Full-bleed colour, ticket card, big joy.
// ---------------------------------------------------------------------------
function event(x: Ctx): string {
  const { c } = x;
  const css = `
.hero{position:relative;overflow:hidden;color:#fff;background:linear-gradient(135deg,var(--a) 0%,var(--a2) 100%);padding:0 0 120px}
.hero:before{content:"";position:absolute;inset:-20% -10% auto auto;width:70%;height:120%;background:radial-gradient(circle,rgba(255,255,255,.28),transparent 60%)}
.hero:after{content:"";position:absolute;left:-10%;bottom:-40%;width:60%;height:90%;background:radial-gradient(circle,rgba(0,0,0,.18),transparent 60%)}
.hero .wrap{position:relative;z-index:1}
.bar{display:flex;align-items:center;justify-content:space-between;height:80px}
.logo{font-weight:800;font-size:19px;letter-spacing:-.02em}
nav{display:flex;gap:26px;font-size:15px;font-weight:500;opacity:.9}
.inner{padding-top:90px;max-width:900px}
.tag{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.18);backdrop-filter:blur(8px);border-radius:999px;padding:8px 16px;font-size:15px;font-weight:600}
.tag svg{width:16px;height:16px}
h1{font-size:clamp(50px,9vw,128px);font-weight:900;letter-spacing:-.05em;line-height:.92;margin:26px 0 24px}
.lead{font-size:clamp(19px,2.2vw,25px);max-width:30em;opacity:.95}
.btn.light{background:#fff;color:var(--a)}
.actions{margin-top:36px;display:flex;gap:12px;flex-wrap:wrap}
.btn.line{background:transparent;color:#fff;box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.7)}
.details{padding:104px 0}
.details h2{font-size:clamp(34px,4.6vw,56px);font-weight:900;letter-spacing:-.04em;margin-bottom:44px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px}
.card{border-radius:26px;padding:30px;background:var(--soft);position:relative;overflow:hidden}
.card .ic{width:50px;height:50px;border-radius:14px;background:var(--a);color:#fff;display:grid;place-items:center;margin-bottom:40px}
.card h3{font-size:24px;font-weight:800}
.card:nth-child(even){background:var(--soft2)}
.card:nth-child(even) .ic{background:var(--a2)}
.about{padding:0 0 104px}
.about .box{border-radius:32px;background:#1d1d1f;color:#f5f5f7;padding:72px;display:grid;grid-template-columns:.8fr 1.2fr;gap:48px}
.about h2{font-size:clamp(30px,3.8vw,46px);font-weight:900;letter-spacing:-.04em}
.about p{font-size:19px;color:#d2d2d7}
.band{text-align:center;padding:0 0 110px}
.band h2{font-size:clamp(40px,6vw,80px);font-weight:900;letter-spacing:-.05em;background:linear-gradient(90deg,var(--a),var(--a2));-webkit-background-clip:text;background-clip:text;color:transparent}
.band p{font-size:19px;color:#6e6e73;margin:14px 0 30px}
footer{padding:28px 0;border-top:1px solid #e8e8ed;text-align:center;font-size:14px;color:#86868b}
@media (max-width:860px){nav{display:none}.inner{padding-top:48px}.about .box{grid-template-columns:1fr;padding:40px 28px;gap:18px}}
`;
  const cards = x.services
    .map((s, i) => `<div class="card"><div class="ic">${icon(x.icons[i % x.icons.length])}</div><h3>${s}</h3></div>`)
    .join("");
  return `${head(c.brand, css, x.a)}<body>
<section class="hero"><div class="wrap"><div class="bar"><a class="logo" href="#">${c.brand}</a><nav><a href="#details">${x.sectionTitle}</a><a href="#about">About</a><a href="#contact">Contact</a></nav></div>
<div class="inner">${c.place ? `<span class="tag">${icon("pin")}${c.place}</span>` : ""}<h1>${c.brand}</h1><p class="lead">${c.tagline && c.tagline !== c.brand ? `${c.tagline}. ` : ""}${c.intro}</p><div class="actions"><a class="btn light" href="#contact">${c.cta} ${icon("arrow")}</a><a class="btn line" href="#details">Find out more</a></div></div></div></section>
<section id="details" class="details"><div class="wrap"><h2>${x.sectionTitle}</h2><div class="cards">${cards}</div></div></section>
<section id="about" class="about"><div class="wrap"><div class="box"><h2>About ${c.brand}</h2><p>${c.about}</p></div></div></section>
<section id="contact" class="band"><div class="wrap"><h2>${x.ctaLine}</h2><p>${c.contact || (c.place ? `${c.place}. Everyone welcome.` : "Everyone welcome.")}</p><a class="btn" href="#contact">${c.cta} ${icon("arrow")}</a></div></section>
<footer><div class="wrap">© ${x.year} ${c.brand}</div></footer>
</body></html>`;
}

const RENDERERS: Record<LayoutId, (x: Ctx) => string> = { classic, bold, studio, minimal, event };

export function renderSite(input: RenderInput): string {
  const x = context(input);
  return (RENDERERS[input.layout] ?? classic)(x);
}

export function suggestedDomain(brand: string): string {
  const label = brand
    .toLowerCase()
    .normalize("NFKD")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 40);
  return `${label || "yourname"}.co.uk`;
}
