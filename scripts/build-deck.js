#!/usr/bin/env node
/* Single source -> PDF/deck. Reads the SAME proof-cases.json the website uses
   (scripts/build-cases.js) + pulls case hero images from the shared Sanity CMS,
   so the deck never drifts from the site. Outputs an editable .pptx to dist/.
   Run: npm run build:deck   (then export PDF from PowerPoint/Keynote). */
const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const IMG = path.join(ROOT, "images") + "/";
const PID = "x6yzy771", DS = "production";
const SCOPE = { "side-event": "Side Event", "owned-summit": "Owned Summit", "korea-entry": "Korea Market Entry", "booth": "Booth & Exhibition", "investor-dinner": "Investor Dinner", "activation": "Activation", "conference-production": "Conference Production" };
function imgUrl(ref, w) {
  if (!ref) return null;
  const m = ref.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/);
  return m ? `https://cdn.sanity.io/images/${PID}/${DS}/${m[1]}-${m[2]}.${m[3]}` + (w ? `?w=${w}&auto=format&fit=max` : "") : null;
}

const C = { bg: "151515", bg2: "1F1F1F", ink: "111107", w: "F4F1EC", mut: "9A9A9A", line: "3A3A3A", lime: "D6FF3F", mag: "FF3D9A", blue: "5B8CFF" };
const ACC = { c1: C.lime, c2: C.mag, c3: C.blue };
const F = { serif: "Georgia", mono: "Consolas", body: "Calibri" };
const W = 13.333, H = 7.5;

(async () => {
  // hero images from Sanity, keyed by sanitySlug
  const res = await fetch(`https://${PID}.apicdn.sanity.io/v2021-10-21/data/query/${DS}?query=${encodeURIComponent('*[_type=="plate" && proof==true]{"slug":slug.current,image}')}`);
  const heroBy = {};
  for (const it of (await res.json()).result) heroBy[it.slug] = imgUrl(it.image && it.image.asset && it.image.asset._ref, 1600);
  const cases = JSON.parse(fs.readFileSync(path.join(ROOT, "cases/proof-cases.json"), "utf8")).sort((a, b) => (a.order || 99) - (b.order || 99));

  const p = new pptxgen();
  p.defineLayout({ name: "W", width: W, height: H }); p.layout = "W";
  p.author = "PROOF — by Chris & Partners"; p.title = "PROOF — Portfolio 2026";
  const kicker = (s, t, x, y, c = C.lime) => s.addText(t, { x, y, w: 10, h: 0.3, margin: 0, fontFace: F.mono, fontSize: 11.5, color: c, charSpacing: 2 });
  const pageNum = (s, n) => s.addText(String(n).padStart(2, "0"), { x: W - 1.1, y: H - 0.55, w: 0.8, h: 0.3, margin: 0, align: "right", fontFace: F.mono, fontSize: 10, color: C.mut });
  const footer = (s) => s.addText("PROOF  ·  BY CHRIS & PARTNERS", { x: 0.7, y: H - 0.55, w: 6, h: 0.3, margin: 0, fontFace: F.mono, fontSize: 8.5, color: C.mut, charSpacing: 1 });
  const dark = (s, x, y, w, h, t) => s.addShape(p.shapes.RECTANGLE, { x, y, w, h, fill: { color: "0E0E0E", transparency: t } });
  const full = (s, file) => s.addImage({ path: file, x: 0, y: 0, w: W, h: H, sizing: { type: "cover", w: W, h: H } });
  const metaLine = (c) => [c.host, c.location].filter(Boolean).join("  ·  ");
  let s;

  // COVER
  s = p.addSlide(); s.background = { color: C.bg }; full(s, IMG + "hero.jpeg"); dark(s, 0, 0, W, H, 55);
  s.addText("PROOF", { x: 0.7, y: 0.55, w: 4, h: 0.6, margin: 0, fontFace: F.serif, fontSize: 26, bold: true, color: C.w, charSpacing: 2 });
  kicker(s, "WEB3 EVENT AGENCY  ·  BY CHRIS & PARTNERS  ·  SEOUL", 0.72, 3.45);
  s.addText([{ text: "Global Stages.", options: { breakLine: true, color: C.w } }, { text: "Proven ", options: { color: C.lime } }, { text: "Execution.", options: { color: C.w } }], { x: 0.66, y: 3.75, w: 11, h: 2.1, margin: 0, fontFace: F.serif, italic: true, fontSize: 60, lineSpacingMultiple: 0.96 });
  s.addText("Portfolio  ·  2026", { x: 0.72, y: 6.55, w: 6, h: 0.4, margin: 0, fontFace: F.mono, fontSize: 12, color: C.mut, charSpacing: 1 });

  // WHO WE ARE
  s = p.addSlide(); s.background = { color: C.bg };
  s.addImage({ path: IMG + "about.jpg", x: 8.2, y: 0, w: 5.133, h: H, sizing: { type: "cover", w: 5.133, h: H } }); dark(s, 8.2, 0, 5.133, H, 72);
  kicker(s, "01 — WHO WE ARE", 0.7, 0.7);
  s.addText([{ text: "The Web3 division of", options: { breakLine: true, color: C.w } }, { text: "Chris & Partners.", options: { color: C.lime } }], { x: 0.66, y: 1.15, w: 7.2, h: 1.8, margin: 0, fontFace: F.serif, fontSize: 40, lineSpacingMultiple: 1.0 });
  s.addText("PROOF is the Web3-native arm of Chris & Partners — a Seoul-based professional event organizer with 15 years of international operations. We produce Seoul Meta Week, ran Polygon's Aggregation Summit in Bangkok, and delivered Sahara AI's booth and side events at TOKEN2049 Singapore. We know the venues, the vendors and the variables — before you brief us.", { x: 0.7, y: 3.05, w: 6.9, h: 1.9, margin: 0, fontFace: F.body, fontSize: 15.5, color: C.w, lineSpacingMultiple: 1.3 });
  [["150+", "Events organized"], ["15yr", "PCO track record"], ["Global", "Event operations"], ["Seoul", "Headquarters"]].forEach((st, i) => {
    const sx = 0.7 + i * 1.78;
    s.addText(st[0], { x: sx, y: 5.45, w: 1.7, h: 0.7, margin: 0, fontFace: F.serif, fontSize: 33, color: C.lime });
    s.addText(st[1].toUpperCase(), { x: sx, y: 6.18, w: 1.7, h: 0.5, margin: 0, fontFace: F.mono, fontSize: 9.5, color: C.mut, charSpacing: 1 });
  });
  footer(s); pageNum(s, 2);

  // WHAT WE DO
  s = p.addSlide(); s.background = { color: C.bg };
  kicker(s, "02 — WHAT WE DO", 0.7, 0.62);
  s.addText("What we do.", { x: 0.66, y: 1.02, w: 9, h: 1.0, margin: 0, fontFace: F.serif, fontSize: 40, color: C.w });
  [["expertise-01.jpg", "Conferences & Summits", "Owned summits (Seoul Meta Week) and full conference production for clients (Polygon)."],
   ["expertise-02.jpg", "Side Events & Activations", "TOKEN2049, KBW, Polygon. Venue, branding, AV, on-site staffing."],
   ["expertise-03.jpg", "Private Dinners & VIP", "Curated events for investor relations and strategic partnerships."],
   ["expertise-04.jpg", "Korea Market Entry", "Full PCO for global Web3 projects entering the Korean market."]].forEach((c, i) => {
    const cardW = 2.92, cardH = 3.55, x = 0.7 + i * (cardW + 0.3), cardY = 2.5;
    s.addImage({ path: IMG + c[0], x, y: cardY, w: cardW, h: cardH, sizing: { type: "cover", w: cardW, h: cardH } });
    dark(s, x, cardY, cardW, cardH, 30); dark(s, x, cardY + cardH - 1.7, cardW, 1.7, 16);
    s.addText("0" + (i + 1), { x: x + 0.18, y: cardY + 0.16, w: 1, h: 0.4, margin: 0, fontFace: F.mono, fontSize: 11, color: C.lime });
    s.addText(c[1], { x: x + 0.18, y: cardY + cardH - 1.62, w: cardW - 0.36, h: 0.8, margin: 0, fontFace: F.serif, fontSize: 17.5, color: C.w, lineSpacingMultiple: 0.98 });
    s.addText(c[2], { x: x + 0.18, y: cardY + cardH - 0.78, w: cardW - 0.36, h: 0.7, margin: 0, fontFace: F.body, fontSize: 11, color: "D9D5CE", lineSpacingMultiple: 1.1 });
  });
  footer(s); pageNum(s, 3);

  // WHY PROOF — positioning (deck-only copy, not from proof-cases.json)
  s = p.addSlide(); s.background = { color: C.bg };
  kicker(s, "03 — WHY PROOF", 0.7, 0.7);
  s.addText([{ text: "Global teams land for the one week ", options: { color: C.w } }, { text: "that matters", options: { color: C.lime } }, { text: " — with no ground game.", options: { color: C.w } }], { x: 0.66, y: 1.12, w: 11.8, h: 1.7, margin: 0, fontFace: F.serif, fontSize: 38, lineSpacingMultiple: 1.0 });
  s.addText("Seoul, Singapore, Bangkok — the rooms book out, the vendors are spoken for, and the calendar doesn't move. PROOF is the operator that's already there: 150+ events across the region, the venues and suppliers on speed-dial, and the failure points mapped before you brief us.", { x: 0.7, y: 3.0, w: 11.4, h: 1.2, margin: 0, fontFace: F.body, fontSize: 15.5, color: "D9D5CE", lineSpacingMultiple: 1.32 });
  [["Local ground ops", "Venues, vendors and crew secured in markets you don't operate in.", C.lime],
   ["Owned & client", "From our own Seoul Meta Week to full production for Polygon.", C.mag],
   ["End to end", "Brief to on-site — run-of-show, AV, staffing, the variables.", C.blue]].forEach((col, i) => {
    const cx = 0.7 + i * 4.0;
    s.addShape(p.shapes.RECTANGLE, { x: cx, y: 4.7, w: 0.42, h: 0.05, fill: { color: col[2] } });
    s.addText(col[0], { x: cx, y: 4.9, w: 3.7, h: 0.5, margin: 0, fontFace: F.serif, fontSize: 21, color: C.w });
    s.addText(col[1], { x: cx, y: 5.5, w: 3.7, h: 1.0, margin: 0, fontFace: F.body, fontSize: 12.5, color: C.mut, lineSpacingMultiple: 1.28 });
  });
  footer(s); pageNum(s, 4);

  // SELECTED WORK — contents / index of the 12 cases
  s = p.addSlide(); s.background = { color: C.bg };
  kicker(s, "SELECTED WORK", 0.7, 0.7);
  s.addText([{ text: "Twelve proofs, ", options: { color: C.w } }, { text: "not promises.", options: { color: C.lime } }], { x: 0.66, y: 1.12, w: 11.5, h: 0.9, margin: 0, fontFace: F.serif, fontSize: 32 });
  cases.forEach((c, i) => {
    const col = Math.floor(i / 6), row = i % 6, x = 0.7 + col * 6.25, y = 2.55 + row * 0.73;
    const acc = ACC[c.accent] || C.lime;
    s.addText(String(i + 1).padStart(2, "0"), { x, y: y + 0.04, w: 0.6, h: 0.5, margin: 0, fontFace: F.mono, fontSize: 13, color: acc });
    s.addText(c.title, { x: x + 0.6, y, w: 4.3, h: 0.45, margin: 0, fontFace: F.serif, fontSize: 16, color: C.w, fit: "shrink" });
    s.addText((SCOPE[c.scope] || "Web3 Event").toUpperCase(), { x: x + 0.6, y: y + 0.38, w: 4.9, h: 0.28, margin: 0, fontFace: F.mono, fontSize: 8, color: C.mut, charSpacing: 1 });
    s.addShape(p.shapes.LINE, { x, y: y + 0.68, w: 5.4, h: 0, line: { color: C.line, width: 0.5 } });
  });
  footer(s); pageNum(s, 5);

  // CASE SLIDES — from proof-cases.json + Sanity images
  let pg = 6, caseNo = 0;
  const total = cases.length;
  for (const c of cases) {
    caseNo++;
    const sl = p.addSlide(); sl.background = { color: C.bg };
    const acc = ACC[c.accent] || C.lime;
    const hero = heroBy[c.sanitySlug];
    if (hero) { sl.addImage({ path: hero, x: 0, y: 0, w: 6.9, h: H, sizing: { type: "cover", w: 6.9, h: H } }); dark(sl, 0, 0, 6.9, H, 32); dark(sl, 0, H - 1.4, 6.9, 1.4, 12); }
    else { sl.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: 6.9, h: H, fill: { color: C.bg2 } }); }
    sl.addText([{ text: "CASE ", options: { color: C.w } }, { text: String(caseNo).padStart(2, "0"), options: { color: acc } }, { text: " / " + total, options: { color: C.mut } }], { x: 0.5, y: H - 0.72, w: 3, h: 0.32, margin: 0, fontFace: F.mono, fontSize: 11, charSpacing: 1 });
    const rx = 7.35, rw = 5.45;
    kicker(sl, (SCOPE[c.scope] || "Web3 Event").toUpperCase(), rx, 0.78, acc);
    sl.addText(c.title, { x: rx - 0.04, y: 1.16, w: rw, h: 1.35, margin: 0, fontFace: F.serif, fontSize: 29, color: C.w, lineSpacingMultiple: 0.97, fit: "shrink" });
    sl.addText(metaLine(c).toUpperCase(), { x: rx, y: 2.58, w: rw, h: 0.4, margin: 0, fontFace: F.mono, fontSize: 9.5, color: C.mut, charSpacing: 0.5 });
    sl.addText(c.summary, { x: rx, y: 3.08, w: rw - 0.05, h: 1.55, margin: 0, fontFace: F.body, fontSize: 13, color: C.w, lineSpacingMultiple: 1.28 });
    // stat bar — up to 3 KPIs
    (c.kpis || []).slice(0, 3).forEach((k, i) => {
      const kx = rx + i * (rw / 3);
      sl.addText(String(k.value), { x: kx, y: 4.82, w: rw / 3 - 0.12, h: 0.55, margin: 0, fontFace: F.serif, fontSize: 21, color: acc, fit: "shrink" });
      sl.addText(String(k.label).toUpperCase(), { x: kx, y: 5.42, w: rw / 3 - 0.12, h: 0.5, margin: 0, fontFace: F.mono, fontSize: 8, color: C.mut, charSpacing: 0.5, lineSpacingMultiple: 0.96 });
    });
    // scope / what we ran
    if (c.scopeItems && c.scopeItems.length) {
      sl.addText("SCOPE", { x: rx, y: 6.08, w: rw, h: 0.28, margin: 0, fontFace: F.mono, fontSize: 8, color: acc, charSpacing: 2 });
      sl.addText(c.scopeItems.join("   ·   "), { x: rx, y: 6.34, w: rw, h: 0.5, margin: 0, fontFace: F.mono, fontSize: 9, color: C.mut, charSpacing: 0.2, fit: "shrink" });
    }
    if (c.quote) {
      sl.addText("“" + c.quote.text + "”", { x: rx, y: 6.85, w: rw, h: 0.5, margin: 0, fontFace: F.serif, italic: true, fontSize: 11, color: "E6E2DB", lineSpacingMultiple: 1.1, fit: "shrink" });
    }
    pageNum(sl, pg++);
  }

  // CLIENTS & OPERATING AT
  s = p.addSlide(); s.background = { color: C.bg };
  kicker(s, "CLIENTS & PARTNERS", 0.7, 0.7);
  ["Polygon", "Sahara AI", "Hashed", "TV Chosun", "Hashkey", "AlchemyPay", "WEMIX", "AEON Protocol", "Solana", "Open Ledger", "Bitgo", "Glosfer"].forEach((cl, i) => {
    const col = i % 4, row = Math.floor(i / 4), x = 0.7 + col * 3.1, y = 1.25 + row * 0.92;
    s.addShape(p.shapes.RECTANGLE, { x, y, w: 2.98, h: 0.8, fill: { color: C.bg2 }, line: { color: C.line, width: 0.75 } });
    s.addText(cl.toUpperCase(), { x, y, w: 2.98, h: 0.8, margin: 0, align: "center", valign: "middle", fontFace: F.mono, fontSize: 12.5, color: C.w, charSpacing: 1 });
  });
  kicker(s, "OPERATING AT", 0.7, 4.65, C.mag);
  const ev = ["Korea Blockchain Week", "TOKEN2049", "Seoul Meta Week", "Aggregation Summit", "Polygon Connect", "Consensus Asia", "EthDenver", "DevCon"];
  s.addText(ev.map((e, i) => ({ text: e + (i < ev.length - 1 ? "   ✳   " : ""), options: { color: i % 2 ? C.w : C.lime } })), { x: 0.66, y: 5.15, w: 12, h: 1.6, margin: 0, fontFace: F.serif, italic: true, fontSize: 26, lineSpacingMultiple: 1.15 });
  footer(s); pageNum(s, pg++);

  // CONTACT
  s = p.addSlide(); s.background = { color: C.bg };
  const closing = heroBy["서울메타위크2025-reimagine-what-is-possible-copy"]; if (closing) { full(s, closing); dark(s, 0, 0, W, H, 28); }
  kicker(s, "LET'S TALK", 0.72, 1.45);
  s.addText([{ text: "Take your project to the ", options: { color: C.w } }, { text: "world stage.", options: { color: C.lime } }], { x: 0.66, y: 1.85, w: 11.5, h: 2.2, margin: 0, fontFace: F.serif, fontSize: 48, lineSpacingMultiple: 1.0 });
  s.addText([{ text: "hello@chrisandpartners.co", options: { breakLine: true, color: C.w, bold: true } }, { text: "+82-2-375-4620", options: { breakLine: true, color: C.w } }, { text: "proof.chrisandpartners.co", options: { color: C.lime } }], { x: 0.7, y: 4.5, w: 7, h: 1.6, margin: 0, fontFace: F.mono, fontSize: 15, lineSpacingMultiple: 1.5 });
  s.addText("PROOF — by Chris & Partners  ·  5F DSM Square, 45 Dokmak-ro 3-gil, Mapo-gu, Seoul, Republic of Korea", { x: 0.72, y: 6.7, w: 12, h: 0.4, margin: 0, fontFace: F.mono, fontSize: 10, color: "CFCBC4", charSpacing: 0.5 });

  fs.mkdirSync(path.join(ROOT, "deck"), { recursive: true });
  await p.writeFile({ fileName: path.join(ROOT, "deck", "PROOF-Portfolio-2026.pptx") });
  console.log(`Deck written — ${cases.length} case slides from proof-cases.json + Sanity images.`);
})();
