// Turns a plain-English description into website content. Deterministic, no model calls,
// so a free preview costs nothing. Runs on the server and in the browser.

export type LayoutId = "classic" | "bold" | "studio" | "minimal" | "event";
export type AccentId = "blue" | "green" | "teal" | "orange" | "pink" | "purple" | "graphite";

export type SiteCategory =
  | "bakery" | "cafe" | "food" | "trades" | "cleaning" | "beauty" | "fitness" | "photography"
  | "tutoring" | "pets" | "health" | "professional" | "shop" | "tech" | "creative" | "events"
  | "community" | "general";

export type SiteContent = {
  brand: string;
  tagline: string;
  intro: string;
  about: string;
  services: string[];
  cta: string;
  contact: string;
  place: string;
  category: SiteCategory;
};

export type IconName =
  | "croissant" | "cake-slice" | "star" | "coffee" | "utensils" | "chef-hat" | "calendar-check" | "wrench"
  | "hammer" | "shield-check" | "sparkles" | "house" | "key-round" | "scissors" | "gift" | "dumbbell"
  | "heart" | "timer" | "camera" | "image" | "graduation-cap" | "book-open" | "laptop" | "paw-print"
  | "dog" | "heart-pulse" | "clipboard-list" | "briefcase" | "chart-line" | "messages-square"
  | "shopping-bag" | "package" | "rocket" | "smartphone" | "zap" | "palette" | "pen-tool" | "calendar-days"
  | "ticket" | "map-pin" | "users" | "hand-heart" | "megaphone" | "leaf" | "flower-2" | "music";

type Sub = { re: RegExp; label: string; services?: string[] };

type Profile = {
  id: SiteCategory;
  re: RegExp;
  label: string;
  subs?: Sub[];
  cta: string;
  services: string[];
  layout: LayoutId;
  accent: AccentId;
  icons: IconName[];
  tagline?: (label: string, place: string) => string;
  about: (brand: string, label: string, place: string) => string;
};

const inPlace = (label: string, place: string) => (place ? `${label} in ${place}` : label);

const PROFILES: Profile[] = [
  {
    id: "photography",
    re: /\b(photographer|photography|videographer|videography|photo ?shoots?|headshots)\b/i,
    label: "Photography",
    subs: [
      { re: /\bwedding/i, label: "Wedding photography", services: ["Full-day weddings", "Engagement shoots", "Albums and prints"] },
      { re: /\b(family|newborn|baby)/i, label: "Family photography", services: ["Family sessions", "Newborns", "Prints and albums"] },
      { re: /\b(headshot|corporate|brand)/i, label: "Headshots and brand photography", services: ["Headshots", "Brand shoots", "Team days"] },
      { re: /\bvideo/i, label: "Video production", services: ["Brand films", "Events", "Social clips"] },
    ],
    cta: "Check availability",
    services: ["Portraits", "Events", "Commercial"],
    layout: "studio",
    accent: "graphite",
    icons: ["camera", "heart", "image"],
    tagline: inPlace,
    about: (b, l, p) => `${b} offers ${l.toLowerCase()}${p ? ` in ${p} and beyond` : ""}. Relaxed sessions, honest pictures and a gallery you will want to keep. Tell us about your plans and we will check the date.`,
  },
  {
    id: "pets",
    re: /\b(dogs?|puppy|puppies|cats?|pets?|dog ?walk\w*|kennels?|cattery|dog groom\w*|pet groom\w*)\b/i,
    label: "Pet care",
    subs: [
      { re: /\bwalk/i, label: "Dog walking", services: ["Group walks", "Solo walks", "Puppy visits"] },
      { re: /\bgroom/i, label: "Dog grooming", services: ["Full grooms", "Bath and brush", "Nail clipping"] },
      { re: /\b(sit|boarding|stay)/i, label: "Pet sitting", services: ["Home visits", "Overnight stays", "Holiday cover"] },
      { re: /\btrain/i, label: "Dog training", services: ["Puppy classes", "One-to-one training", "Recall and lead work"] },
    ],
    cta: "Book now",
    services: ["Walks", "Pet sitting", "Home visits"],
    layout: "classic",
    accent: "green",
    icons: ["paw-print", "dog", "house"],
    tagline: inPlace,
    about: (b, l, p) => `${b} offers ${l.toLowerCase()}${p ? ` in ${p}` : ""}. Your pet gets the same care and attention we give our own. Get in touch to arrange a first visit.`,
  },
  {
    id: "tutoring",
    re: /\b(tutor\w*|tuition|lessons?|teach\w*|instructor|gcse|a-levels?|11\+|revision)\b/i,
    label: "Private tutoring",
    subs: [
      { re: /\bmaths?\b/i, label: "Maths tutoring" },
      { re: /\benglish\b/i, label: "English tutoring" },
      { re: /\b(piano|guitar|music|singing|violin|drum)/i, label: "Music lessons", services: ["Beginners welcome", "Exam grades", "Online lessons"] },
      { re: /\bdriving/i, label: "Driving lessons", services: ["Beginner lessons", "Test preparation", "Refresher lessons"] },
      { re: /\b(spanish|french|german|italian|language)/i, label: "Language lessons" },
    ],
    cta: "Book a lesson",
    services: ["One-to-one lessons", "Exam preparation", "Online sessions"],
    layout: "minimal",
    accent: "green",
    icons: ["graduation-cap", "book-open", "laptop"],
    tagline: inPlace,
    about: (b, l, p) => `${b} offers ${l.toLowerCase()}${p ? ` in ${p} and online` : ", in person and online"}. Patient, structured lessons that build confidence as well as results.`,
  },
  {
    id: "fitness",
    re: /\b(personal train\w*|fitness|gym|yoga|pilates|bootcamp|workouts?|strength|hiit|running coach)\b/i,
    label: "Personal training",
    subs: [
      { re: /\byoga/i, label: "Yoga classes", services: ["Beginners classes", "Flow and strength", "Private sessions"] },
      { re: /\bpilates/i, label: "Pilates classes", services: ["Mat pilates", "Small groups", "Private sessions"] },
      { re: /\bbootcamp/i, label: "Outdoor bootcamp", services: ["Morning sessions", "All abilities", "Monthly passes"] },
    ],
    cta: "Book a session",
    services: ["One-to-one sessions", "Small group classes", "Online coaching"],
    layout: "bold",
    accent: "orange",
    icons: ["dumbbell", "users", "timer"],
    tagline: inPlace,
    about: (b, l, p) => `${b} offers ${l.toLowerCase()}${p ? ` in ${p}` : ""}. Sessions built around you, whatever your starting point. Book a first session and we will take it from there.`,
  },
  {
    id: "beauty",
    re: /\b(salon|hair\w*|barber\w*|nails?|beauty|lash\w*|brows?|make-?up|spa|massage|facials?)\b/i,
    label: "Beauty salon",
    subs: [
      { re: /\bbarber/i, label: "Barber", services: ["Haircuts", "Skin fades", "Beard trims"] },
      { re: /\bhair/i, label: "Hair salon", services: ["Cuts and styling", "Colour", "Treatments"] },
      { re: /\bnails?\b/i, label: "Nail studio", services: ["Gel manicures", "Pedicures", "Nail art"] },
      { re: /\b(lash|brow)/i, label: "Lash and brow studio", services: ["Lash extensions", "Brow shaping", "Lash lifts"] },
      { re: /\bmassage/i, label: "Massage", services: ["Deep tissue", "Relaxing massage", "Sports massage"] },
      { re: /\bmake-?up/i, label: "Make-up artist", services: ["Bridal make-up", "Special occasions", "Lessons"] },
    ],
    cta: "Book an appointment",
    services: ["Treatments", "Special occasions", "Gift vouchers"],
    layout: "classic",
    accent: "pink",
    icons: ["scissors", "sparkles", "gift"],
    tagline: inPlace,
    about: (b, _l, p) => `Welcome to ${b}${p ? ` in ${p}` : ""}. Take a seat, relax, and leave feeling like yourself again.`,
  },
  {
    id: "cleaning",
    re: /\b(cleaner|cleaners|cleaning|valeting|ironing service|window clean\w*)\b/i,
    label: "Cleaning",
    subs: [
      { re: /\bwindow/i, label: "Window cleaning", services: ["Homes", "Shops and offices", "Gutters and fascias"] },
      { re: /\b(car|valet)/i, label: "Car valeting", services: ["Mini valets", "Full valets", "Interior deep cleans"] },
      { re: /\b(office|commercial)/i, label: "Commercial cleaning", services: ["Offices", "Shops", "One-off deep cleans"] },
    ],
    cta: "Get a quote",
    services: ["Regular cleans", "Deep cleans", "End of tenancy"],
    layout: "classic",
    accent: "teal",
    icons: ["sparkles", "house", "key-round"],
    tagline: inPlace,
    about: (b, l, p) => `${b} provides ${l.toLowerCase()}${p ? ` across ${p}` : ""}. Careful, thorough and on time, so you can get on with your day.`,
  },
  {
    id: "bakery",
    re: /\b(bak\w*|bread|sourdough|cakes?|cupcakes?|patisserie|pastr\w*|brownies|cookies|doughnuts?)\b/i,
    label: "Bakery",
    cta: "Order now",
    services: ["Fresh bread", "Celebration cakes", "Weekly specials"],
    layout: "bold",
    accent: "orange",
    icons: ["croissant", "cake-slice", "star"],
    tagline: (_l, p) => (p ? `Fresh baking in ${p}` : "Fresh baking, made with care"),
    about: (b, _l, p) => `${b} bakes in small batches${p ? ` in ${p}` : ""}. Order ahead for celebrations, or come early for the best of the day.`,
  },
  {
    id: "cafe",
    re: /\b(caf[eé]|coffee|brunch|tea ?rooms?|espresso)\b/i,
    label: "Café",
    cta: "See the menu",
    services: ["Speciality coffee", "Brunch", "Homemade cakes"],
    layout: "bold",
    accent: "orange",
    icons: ["coffee", "utensils", "cake-slice"],
    tagline: (_l, p) => (p ? `Good coffee in ${p}` : "Good coffee, good company"),
    about: (b, _l, p) => `${b} is an independent café${p ? ` in ${p}` : ""}. Pull up a chair, stay a while.`,
  },
  {
    id: "trades",
    re: /\b(plumb\w*|electrician|electrical|builders?|building work|roof\w*|joiner\w*|carpent\w*|decorat\w*|painter|handyman|gardener|gardening|landscap\w*|locksmith|tiler|tiling|heating|boilers?|kitchen fitt\w*|bathroom fitt\w*|plaster\w*|removals?)\b/i,
    label: "Local trades",
    subs: [
      { re: /\bplumb/i, label: "Plumbing", services: ["Leaks and repairs", "Bathroom installs", "Boiler servicing"] },
      { re: /\belectric/i, label: "Electrical services", services: ["Rewires", "Fuse boards", "Lighting and sockets"] },
      { re: /\broof/i, label: "Roofing", services: ["Roof repairs", "New roofs", "Guttering"] },
      { re: /\b(gardener|gardening|landscap)/i, label: "Gardening and landscaping", services: ["Garden maintenance", "Lawn care", "Hedges and planting"] },
      { re: /\b(decorat|painter)/i, label: "Painting and decorating", services: ["Interior painting", "Exterior painting", "Wallpapering"] },
      { re: /\b(joiner|carpent)/i, label: "Joinery", services: ["Doors and skirting", "Fitted furniture", "Repairs"] },
      { re: /\blocksmith/i, label: "Locksmith", services: ["Lockouts", "Lock changes", "Security upgrades"] },
      { re: /\bremoval/i, label: "Removals", services: ["Home moves", "Office moves", "Man and van"] },
      { re: /\bbuild/i, label: "Building services", services: ["Extensions", "Renovations", "Repairs"] },
      { re: /\b(heating|boiler)/i, label: "Heating engineers", services: ["Boiler installs", "Servicing", "Breakdowns"] },
    ],
    cta: "Get a free quote",
    services: ["Repairs", "Installations", "Maintenance"],
    layout: "classic",
    accent: "blue",
    icons: ["wrench", "hammer", "shield-check"],
    tagline: inPlace,
    about: (b, l, p) => `${b} provides ${l.toLowerCase()}${p ? ` in ${p} and nearby` : ""}. Clear quotes, tidy work and no surprises.`,
  },
  {
    id: "food",
    re: /\b(restaurant|catering|caterer|street food|food truck|food van|takeaway|pizza|chef|supper club|meal prep|burgers?|tacos?|bbq|barbecue)\b/i,
    label: "Food and catering",
    cta: "Book us",
    services: ["Private events", "Weddings and parties", "Office catering"],
    layout: "bold",
    accent: "orange",
    icons: ["chef-hat", "utensils", "calendar-check"],
    tagline: (_l, p) => (p ? `Great food in ${p}` : "Great food for every occasion"),
    about: (b, _l, p) => `${b} cooks with good ingredients and a lot of care${p ? `, in ${p}` : ""}. Tell us what you are planning and we will make it delicious.`,
  },
  {
    id: "health",
    re: /\b(clinic|physio\w*|therap\w*|counsell\w*|dentist|dental|osteopath\w*|chiropract\w*|nutrition\w*|dietitian|acupunct\w*|podiatr\w*|optician)\b/i,
    label: "Private healthcare",
    subs: [
      { re: /\bphysio/i, label: "Physiotherapy" },
      { re: /\b(counsell|psychotherap)/i, label: "Counselling", services: ["Individual sessions", "Couples", "Online sessions"] },
      { re: /\bnutrition|dietitian/i, label: "Nutrition coaching" },
      { re: /\bosteopath/i, label: "Osteopathy" },
    ],
    cta: "Book an appointment",
    services: ["Initial assessment", "Treatment plans", "Follow-up sessions"],
    layout: "minimal",
    accent: "teal",
    icons: ["heart-pulse", "clipboard-list", "calendar-check"],
    tagline: inPlace,
    about: (b, l, p) => `${b} offers ${l.toLowerCase()}${p ? ` in ${p}` : ""}. We listen first, explain clearly, and build a plan around you.`,
  },
  {
    id: "professional",
    re: /\b(consult\w*|accountan\w*|bookkeep\w*|solicitor|lawyer|legal|adviser|advisor|mortgage|financial planner|coach|coaching|freelance\w*|marketing|copywrit\w*|recruit\w*|architect|surveyor|virtual assistant|web design\w*)\b/i,
    label: "Consultancy",
    subs: [
      { re: /\b(accountan|bookkeep)/i, label: "Accountancy", services: ["Tax returns", "Bookkeeping", "Year-end accounts"] },
      { re: /\bcoach/i, label: "Coaching", services: ["One-to-one coaching", "Workshops", "Online sessions"] },
      { re: /\bmarketing/i, label: "Marketing", services: ["Strategy", "Social media", "Campaigns"] },
      { re: /\bcopywrit/i, label: "Copywriting", services: ["Websites", "Brochures", "Blogs and emails"] },
      { re: /\bweb design/i, label: "Web design", services: ["New websites", "Redesigns", "Ongoing care"] },
      { re: /\barchitect/i, label: "Architecture", services: ["Extensions", "New builds", "Planning drawings"] },
      { re: /\bvirtual assistant/i, label: "Virtual assistance", services: ["Inbox and diary", "Admin", "Bookkeeping support"] },
    ],
    cta: "Book a call",
    services: ["Advice", "Planning", "Ongoing support"],
    layout: "minimal",
    accent: "blue",
    icons: ["briefcase", "chart-line", "messages-square"],
    tagline: inPlace,
    about: (b, l, p) => `${b} offers ${l.toLowerCase()}${p ? ` from ${p}` : ""}. Straight answers, practical help, and someone who picks up the phone.`,
  },
  {
    id: "shop",
    re: /\b(shop|store|sell\w*|products?|handmade|crafts?|jewell?ery|candles?|clothing|apparel|boutique|prints|gifts?|soaps?|skincare|homeware)\b/i,
    label: "Independent shop",
    subs: [
      { re: /\bjewell?ery/i, label: "Jewellery", services: ["New pieces", "Gifts", "Made to order"] },
      { re: /\bcandles?/i, label: "Candles", services: ["Signature scents", "Gift sets", "Made to order"] },
      { re: /\b(clothing|apparel)/i, label: "Clothing", services: ["New in", "Best sellers", "Gift cards"] },
      { re: /\bhandmade|crafts?/i, label: "Handmade goods" },
    ],
    cta: "Shop now",
    services: ["New arrivals", "Gifts", "Made to order"],
    layout: "bold",
    accent: "pink",
    icons: ["shopping-bag", "gift", "package"],
    tagline: (l, p) => (p ? `${l} from ${p}` : l),
    about: (b, _l, p) => `${b} is a small, independent business${p ? ` from ${p}` : ""}. Everything is chosen with care, and every order is packed by hand.`,
  },
  {
    id: "tech",
    re: /\b(app|apps|platform|software|saas|startup|marketplace|tool|dashboard|extension|bot|website that|site that)\b/i,
    label: "App",
    cta: "Get early access",
    services: ["Quick to set up", "Works on any device", "Always up to date"],
    layout: "bold",
    accent: "blue",
    icons: ["rocket", "smartphone", "zap"],
    about: (b) => `${b} is being built right now. Join the early access list and be first to try it.`,
  },
  {
    id: "creative",
    re: /\b(artist|illustrat\w*|graphic design\w*|musician|band|singer|dj|writer|author|poet|portfolio|animator|designer|ceramic\w*|potter|painting)\b/i,
    label: "Creative studio",
    subs: [
      { re: /\billustrat/i, label: "Illustration", services: ["Commissions", "Editorial", "Prints"] },
      { re: /\b(musician|band|singer|dj)\b/i, label: "Music", services: ["Live shows", "Weddings and events", "Recordings"] },
      { re: /\b(writer|author|poet)\b/i, label: "Writing", services: ["Books", "Commissions", "Workshops"] },
      { re: /\b(ceramic|potter)/i, label: "Ceramics", services: ["Studio pieces", "Commissions", "Workshops"] },
      { re: /\bgraphic design/i, label: "Graphic design", services: ["Branding", "Print", "Digital"] },
    ],
    cta: "Get in touch",
    services: ["Commissions", "Collaborations", "Prints"],
    layout: "studio",
    accent: "purple",
    icons: ["palette", "pen-tool", "sparkles"],
    tagline: (l, p) => (p ? `${l} in ${p}` : ""),
    about: (b, _l, p) => `This is the home of ${b}${p ? `, based in ${p}` : ""}. Original work, made with care. Get in touch about commissions and collaborations.`,
  },
  {
    id: "events",
    re: /\b(wedding|party|parties|festival|events?|gig|conference|meetup|meet-up|reunion|fundraiser|workshops?|retreat)\b/i,
    label: "Events",
    subs: [
      { re: /\bwedding/i, label: "Our wedding", services: ["The day", "Getting there", "Where to stay"] },
      { re: /\bfestival/i, label: "Festival", services: ["Line-up", "Tickets", "Getting there"] },
      { re: /\b(workshop|retreat)/i, label: "Workshops", services: ["What you will learn", "Dates", "Book a place"] },
    ],
    cta: "Get tickets",
    services: ["What’s on", "Tickets", "Getting there"],
    layout: "event",
    accent: "purple",
    icons: ["calendar-days", "ticket", "map-pin"],
    tagline: (l, p) => (p ? `${l} in ${p}` : ""),
    about: (b, _l, p) => `${b}${p ? ` comes to ${p}` : " is coming soon"}. Save the date, bring your friends, and we will take care of the rest.`,
  },
  {
    id: "community",
    re: /\b(club|society|group|choir|team|charity|volunteer\w*|community|church|association|league|network|allotments?)\b/i,
    label: "Community group",
    subs: [
      { re: /\bchoir/i, label: "Choir", services: ["Weekly rehearsals", "Concerts", "All voices welcome"] },
      { re: /\bcharity/i, label: "Charity", services: ["Our work", "Donate", "Volunteer"] },
      { re: /\bclub/i, label: "Club", services: ["Meet-ups", "Membership", "Events"] },
    ],
    cta: "Join us",
    services: ["Meet-ups", "Get involved", "News"],
    layout: "event",
    accent: "green",
    icons: ["users", "hand-heart", "megaphone"],
    tagline: (l, p) => (p ? `${l} in ${p}` : ""),
    about: (b, _l, p) => `${b} brings people together${p ? ` in ${p}` : ""}. Everyone is welcome, so come along and say hello.`,
  },
];

const GENERAL: Profile = {
  id: "general",
  re: /$^/,
  label: "Small business",
  cta: "Get in touch",
  services: ["Friendly service", "Local and independent", "Fair prices"],
  layout: "classic",
  accent: "blue",
  icons: ["star", "heart", "shield-check"],
  about: (b, _l, p) => `${b} is an independent business${p ? ` in ${p}` : ""}. Get in touch and we will be happy to help.`,
};

export function profileFor(category: SiteCategory): Profile {
  return PROFILES.find((p) => p.id === category) ?? GENERAL;
}

export function iconsFor(category: SiteCategory): IconName[] {
  return profileFor(category).icons;
}

const NOT_PLACES = new Set([
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "January", "February", "March", "April",
  "May", "June", "July", "August", "September", "October", "November", "December", "The", "Our", "My", "Your", "English",
  "British", "Instagram", "Facebook", "TikTok", "Etsy", "Amazon", "Google", "Christmas", "Easter", "Spring", "Summer",
  "Autumn", "Winter", "I", "We", "It", "This", "That", "Small", "Big", "Every", "Each",
]);

function words(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function cap(s: string): string {
  const t = s.trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

function clip(s: string, max: number): string {
  const t = words(s);
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const at = cut.lastIndexOf(" ");
  return `${cut.slice(0, at > max * 0.6 ? at : max).replace(/[,;:.\s]+$/, "")}…`;
}

function sentences(text: string): string[] {
  return text
    .replace(/\r/g, "")
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+(?=[A-Z0-9“"'‘])/))
    .map((s) => words(s))
    .filter(Boolean);
}

function readBrand(text: string, name: string): string {
  if (name.trim()) return clip(name, 40);
  const called = text.match(/\b(?:called|named|name is|name’s|name's|brand is)\s+["“‘']?([A-Z0-9][\w&’'-]*(?:\s+(?:[A-Z0-9&][\w&’'-]*|of|and|the|&)){0,4})/);
  if (called) return clip(called[1].replace(/\s+(of|and|the|&)$/i, ""), 40);
  const lead = text.trim().match(/^([A-Z][\w&’'-]*(?:\s+[A-Z&][\w&’'-]*){0,3})\s*(?::|\s-\s|\s–\s|\s+is\s+an?\s)/);
  if (lead && !NOT_PLACES.has(lead[1].split(" ")[0])) return clip(lead[1], 40);
  const by = text.match(/\bby\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/);
  if (by) return clip(by[1], 40);
  return "";
}

function readPlace(text: string, brand: string): string {
  const re = /\b(based in|in|serving|covering|across|around|near|from)\s+([A-Z][a-zA-Z’'-]+(?:(?:\s+(?:upon|on|under|le|de)\s+|\s+|-)[A-Z][a-zA-Z’'-]+){0,2})/g;
  const found: { place: string; strong: boolean }[] = [];
  for (const m of text.matchAll(re)) {
    const place = m[2].replace(/[’']s$/, "");
    const first = place.split(/[\s-]/)[0];
    if (NOT_PLACES.has(first)) continue;
    if (brand && brand.toLowerCase().includes(place.toLowerCase())) continue;
    found.push({ place, strong: ["based in", "in", "serving", "covering"].includes(m[1]) });
  }
  return (found.find((f) => f.strong) ?? found[0])?.place ?? "";
}

function readContact(text: string): string {
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (email) return email[0];
  const phone = text.match(/(?:\+44\s?\(?0?\)?\s?|\b0)(?:\d[\s-]?){9,10}\b/);
  return phone ? words(phone[0]) : "";
}

function detect(text: string): { profile: Profile; label: string; subServices?: string[] } {
  for (const p of PROFILES) {
    if (!p.re.test(text)) continue;
    const sub = p.subs?.find((s) => s.re.test(text));
    return { profile: p, label: sub?.label ?? p.label, subServices: sub?.services };
  }
  return { profile: GENERAL, label: GENERAL.label };
}

const TRIGGER = /^(?:we|i)?\s*(?:sell|selling|offer|offering|do|doing|make|making|provide|providing|cover|covering|include|including|specialis(?:e|ing) in|services?:|menu:|we have|there(?:’|')s)\s+/i;
const QUALITY = /^(?:[a-z]+(?:ed|al|ful|ly|ive|ous|y|ing|ic|le|ble|est|er))$/i;

// Pull a short list of offerings out of the text, if the person gave one.
function readServices(parts: string[]): { items: string[]; used: number; qualities: number } {
  const bullets = parts.filter((s) => /^([-*•]|\d+[.)])\s+/.test(s)).map((s) => s.replace(/^([-*•]|\d+[.)])\s+/, ""));
  if (bullets.length >= 2) return { items: bullets.slice(0, 4).map((b) => cap(clip(b, 40))), used: -1, qualities: -1 };
  for (let i = 0; i < parts.length; i++) {
    const s = parts[i].replace(/[.!?]+$/, "");
    const stripped = s.replace(TRIGGER, "");
    const triggered = stripped !== s;
    const items = stripped
      .split(/,\s*|\s+and\s+|\s+&\s+|\s+plus\s+/i)
      .map((x) => x.trim())
      .filter(Boolean);
    // The first sentence usually says what the thing is, so only mine it for a list when asked to.
    if (i === 0 && !triggered) continue;
    if (items.length < (triggered ? 2 : 3)) continue;
    if (items.some((x) => x.split(" ").length > 5)) continue;
    const single = items.filter((x) => !x.includes(" "));
    if (!triggered && single.length >= 2 && single.every((x) => QUALITY.test(x))) {
      return { items: [], used: -1, qualities: i };
    }
    return { items: items.slice(0, 4).map((x) => cap(clip(x, 40))), used: i, qualities: -1 };
  }
  return { items: [], used: -1, qualities: -1 };
}

// "A bakery stall in York called Bright Crumb." becomes "Bright Crumb is a bakery stall in York."
function asStatement(s: string, brand: string): string {
  const m = s.match(/^(an?|the)\s+(.+?)\s+(?:called|named)\s+.+?[.!]?$/i);
  if (m && brand) return `${brand} is ${m[1].toLowerCase()} ${m[2]}.`;
  const lead = brand ? s.replace(new RegExp(`^${brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*(?::|-|–)\\s*`), "") : s;
  const out = cap(lead);
  return /[.!?]$/.test(out) ? out : `${out}.`;
}

function taglineFromText(first: string, brand: string): string {
  let t = first
    .replace(/\b(?:called|named)\s+.+$/i, "")
    .replace(brand ? new RegExp(`^${brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*(?::|-|–|is)\\s*`, "i") : /^$/, "")
    .replace(/^(?:it(?:’|')?s|this is|i want|i'd like|i would like|we want)\s+/i, "")
    .replace(/^(?:an?|the)\s+(?:app|platform|website|site|tool|service)\s+(?:that|which|to|for|where)\s+/i, "")
    .replace(/[.!?]+$/, "");
  t = words(t);
  return cap(clip(t, 64));
}

export type ParsedSite = { content: SiteContent; layout: LayoutId; accent: AccentId };

export function buildSite(input: { name: string; description: string }): ParsedSite {
  const raw = input.description.trim();
  const { profile, label, subServices } = detect(raw);
  const brandFound = readBrand(raw, input.name);
  const place = readPlace(raw, brandFound);
  const contact = readContact(raw);
  const brand = brandFound || (profile.id === "tech" ? "Your app" : profile.id === "events" ? "Your event" : "Your business");

  const parts = sentences(raw);
  const svc = readServices(parts);
  const isContactLine = (s: string) =>
    (contact && s.includes(contact)) || /^(?:call|phone|ring|text|email|e-mail|whatsapp|contact|find us|follow)\b/i.test(s);
  const rest = parts.filter((s, i) => i !== svc.used && i !== svc.qualities && !isContactLine(s));

  const tagline = cap(profile.tagline?.(label, place) || "") || taglineFromText(rest[0] ?? parts[0] ?? label, brandFound) || label;

  const first = rest[0] ? asStatement(rest[0], brandFound) : "";
  const qualities = svc.qualities >= 0 ? cap(parts[svc.qualities].replace(/[.!?]*$/, ".")) : "";
  let intro = qualities || (rest[1] ? cap(rest[1]) : first);
  intro = clip(intro, 200);

  const aboutParts = [first, ...rest.slice(qualities ? 1 : 2)].filter((s) => s && s !== intro);
  let about = words(aboutParts.join(" "));
  if (about.length < 80) about = words(`${about} ${profile.about(brand, label, place)}`);
  about = clip(about, 600);

  const services = svc.items.length >= 2 ? svc.items : (subServices ?? profile.services);

  return {
    content: {
      brand,
      tagline: tagline || label,
      intro: intro || profile.about(brand, label, place),
      about,
      services: services.slice(0, 4),
      cta: profile.cta,
      contact,
      place,
      category: profile.id,
    },
    layout: profile.layout,
    accent: profile.accent,
  };
}

// Normalise content coming back from an edit form.
export function sanitiseContent(input: Partial<SiteContent>, fallback: SiteContent): SiteContent {
  const str = (v: unknown, max: number, dflt: string) => (typeof v === "string" ? clip(v, max) : dflt);
  const services = Array.isArray(input.services)
    ? input.services.map((s) => (typeof s === "string" ? clip(s, 40) : "")).filter(Boolean).slice(0, 4)
    : fallback.services;
  return {
    brand: str(input.brand, 40, fallback.brand) || fallback.brand,
    tagline: str(input.tagline, 90, fallback.tagline) || fallback.tagline,
    intro: str(input.intro, 220, fallback.intro),
    about: str(input.about, 700, fallback.about),
    services,
    cta: str(input.cta, 30, fallback.cta) || fallback.cta,
    contact: str(input.contact, 80, fallback.contact),
    place: str(input.place, 40, fallback.place),
    category: fallback.category,
  };
}
