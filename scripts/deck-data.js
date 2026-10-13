/* Shared deck data + curation — the single source for BOTH outputs:
   - scripts/build-deck.js       -> deck/PROOF-Portfolio-2026.pptx (editable file)
   - scripts/build-deck-html.js  -> deck/index.html (shareable web deck)
   Curation here is DECK-ONLY: it does NOT touch cases/proof-cases.json or the
   website. Reads the same proof-cases.json + pulls hero images from Sanity. */
const fs = require("fs");
const path = require("path");

const PID = "x6yzy771", DS = "production";

const SCOPE = {
  "side-event": "Side Event", "owned-summit": "Owned Summit", "korea-entry": "Korea Market Entry",
  "booth": "Booth & Exhibition", "investor-dinner": "Investor Dinner", "activation": "Activation",
  "conference-production": "Conference Production", "full-production": "Full Production",
};

// Brand palette (matches the website). Hex without '#'.
const C = { bg: "151515", bg2: "1F1F1F", ink: "111107", w: "F4F1EC", mut: "9A9A9A", line: "3A3A3A", lime: "D6FF3F", mag: "FF3D9A", blue: "5B8CFF" };
const ACC = { c1: C.lime, c2: C.mag, c3: C.blue };

// HERO = full-page slides, in this order. Agency-first: client work, one per event type.
const HERO = ["sahara-ai-connect-party-2025", "aggregation-summit-2024", "polygon-connect-korea", "bitgo-vip-networking-reception"];
const EXCLUDE = ["token2049-singapore"]; // Sahara shown via the party only
const OWNED = ["seoul-meta-week-2025", "seoul-meta-week-2024", "seoul-meta-week-2023", "seoul-meta-week-2022", "metacon-2021"];
const MORE_ORDER = ["ixo", "gensyn-ai-rl-seoul", "polygon-ignite", "hyconhacks", "blockchain-partners-summit"]; // surface newest clients first
// De-brand on the deck (the website still credits the client in full).
const OVERRIDE = {
  "aggregation-summit-2024": {
    host: null, title: "Aggregation Summit 2024",
    summary: "A 1,000+ attendee flagship Web3 summit in Bangkok — PROOF ran it end to end as the APAC event agency, from planning to on-site, across 50+ concurrent programs.",
  },
};

function imgUrl(ref, w) {
  if (!ref) return null;
  const m = String(ref || "").match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/);
  return m ? `https://cdn.sanity.io/images/${PID}/${DS}/${m[1]}-${m[2]}.${m[3]}` + (w ? `?w=${w}&auto=format&fit=max` : "") : null;
}

// Fetch hero + gallery images from Sanity + read + curate proof-cases.json.
async function loadDeck(root) {
  const q = '*[_type=="plate" && proof==true]{"slug":slug.current,"img":image.asset._ref,"gallery":gallery[].asset._ref}';
  const res = await fetch(`https://${PID}.apicdn.sanity.io/v2021-10-21/data/query/${DS}?query=${encodeURIComponent(q)}`);
  const heroBy = {}, galleryBy = {};
  for (const it of (await res.json()).result) {
    heroBy[it.slug] = imgUrl(it.img, 1600);
    galleryBy[it.slug] = (it.gallery || []).map((r) => imgUrl(r, 1200)).filter(Boolean);
  }

  const allCases = JSON.parse(fs.readFileSync(path.join(root, "cases/proof-cases.json"), "utf8")).sort((a, b) => (a.order || 99) - (b.order || 99));
  const bySlug = (slug) => { const c = allCases.find((x) => x.slug === slug); return c ? { ...c, ...(OVERRIDE[slug] || {}) } : null; };

  const heroes = HERO.map(bySlug).filter(Boolean);
  const owned = OWNED.map(bySlug).filter(Boolean);
  const more = allCases.filter((c) => !HERO.includes(c.slug) && !EXCLUDE.includes(c.slug) && !OWNED.includes(c.slug));
  const moreFinal = [...MORE_ORDER.map(bySlug).filter(Boolean), ...more.filter((c) => !MORE_ORDER.includes(c.slug))];

  return { allCases, heroBy, galleryBy, heroes, owned, moreFinal, bySlug };
}

const metaLine = (c) => [c.host, c.location].filter(Boolean).join("  ·  ");
const year = (c) => (String(c.title).match(/(\d{4})/) || [])[1] || "";

// PROPOSAL tiers — format-led, budget embedded (deck-only; NOT in proof-cases.json).
// `acc` is an ACC key (c1=lime, c2=magenta, c3=blue); `proofSlug` resolves a hero image.
const PACKAGES = [
  { acc: "c3", name: "Private Dinner & VIP Reception", budget: "$10–25k", scale: "30–120 guests", time: "3–5 weeks",
    what: "An intimate, invite-only evening that turns key relationships into deals.",
    inc: ["Curated venue & styling", "F&B & hospitality", "Production & run-of-show", "On-site team"],
    proof: "BitGo VIP Reception · KBW 2023", proofSlug: "bitgo-vip-networking-reception" },
  { acc: "c2", name: "Networking Night / Side Party", budget: "$25–50k", scale: "150–350 guests", time: "5–7 weeks",
    what: "A branded night everyone's talking about — the must-attend mixer of the week.",
    inc: ["Venue & build-out", "AV, staging & lighting", "Entertainment / DJ", "Branding & staffing"],
    proof: "Gensyn ai(RL) Seoul · Polygon IGNITE", proofSlug: "gensyn-ai-rl-seoul" },
  { acc: "c1", name: "Flagship Activation", budget: "$50–100k", scale: "300–800 guests", time: "8–12 weeks",
    what: "Your headline moment of the conference week — full production, programming, overseas-capable.",
    inc: ["Marquee venue & full production", "Content & programming", "Sponsor booth (optional)", "Overseas execution & vendors"],
    proof: "Sahara Connect Party · TOKEN2049", proofSlug: "sahara-ai-connect-party-2025" },
  { acc: "c1", invert: true, name: "Conference / Summit Production", budget: "$100k+", scale: "1,000+ attendees", time: "3–6 months",
    what: "A multi-day, multi-track flagship — speakers, exhibition, the full machine.",
    inc: ["Multi-track program & speakers", "Exhibition & sponsors", "Stage, AV & broadcast", "End-to-end operations"],
    proof: "Aggregation Summit · Seoul Meta Week", proofSlug: "aggregation-summit-2024" },
];

module.exports = { PID, DS, SCOPE, C, ACC, HERO, EXCLUDE, OWNED, MORE_ORDER, OVERRIDE, PACKAGES, imgUrl, loadDeck, metaLine, year };
