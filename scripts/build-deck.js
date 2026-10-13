#!/usr/bin/env node
/* Single source -> PDF/deck. Reads the SAME proof-cases.json the website uses
   (scripts/build-cases.js) + pulls case hero images from the shared Sanity CMS,
   so the deck never drifts from the site. Outputs an editable .pptx to dist/.
   Run: npm run build:deck   (then export PDF from PowerPoint/Keynote). */
const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const { SCOPE, C, ACC, PACKAGES, loadDeck, metaLine } = require("./deck-data");

const ROOT = path.join(__dirname, "..");
const IMG = path.join(ROOT, "images") + "/";
const F = { serif: "Georgia", mono: "Consolas", body: "Calibri" }; // PowerPoint-safe fonts
const W = 13.333, H = 7.5;

(async () => {
  const { allCases, heroBy, heroes, owned, moreFinal } = await loadDeck(ROOT);
  const heroForSlug = (slug) => { const c = allCases.find((x) => x.slug === slug); return c ? heroBy[c.sanitySlug] : null; };

  const p = new pptxgen();
  p.defineLayout({ name: "W", width: W, height: H }); p.layout = "W";
  p.author = "PROOF — by Chris & Partners"; p.title = "PROOF — Portfolio 2026";
  const kicker = (s, t, x, y, c = C.lime) => s.addText(t, { x, y, w: 10, h: 0.3, margin: 0, fontFace: F.mono, fontSize: 11.5, color: c, charSpacing: 2 });
  const pageNum = (s, n) => s.addText(String(n).padStart(2, "0"), { x: W - 1.1, y: H - 0.55, w: 0.8, h: 0.3, margin: 0, align: "right", fontFace: F.mono, fontSize: 10, color: C.mut });
  const footer = (s) => s.addText("PROOF  ·  BY CHRIS & PARTNERS", { x: 0.7, y: H - 0.55, w: 6, h: 0.3, margin: 0, fontFace: F.mono, fontSize: 8.5, color: C.mut, charSpacing: 1 });
  const dark = (s, x, y, w, h, t) => s.addShape(p.shapes.RECTANGLE, { x, y, w, h, fill: { color: "0E0E0E", transparency: t } });
  const full = (s, file) => s.addImage({ path: file, x: 0, y: 0, w: W, h: H, sizing: { type: "cover", w: W, h: H } });
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
  s.addText([{ text: "A Web3 event agency,", options: { breakLine: true, color: C.w } }, { text: "built by Chris & Partners.", options: { color: C.lime } }], { x: 0.66, y: 1.05, w: 7.3, h: 1.5, margin: 0, fontFace: F.serif, fontSize: 38, lineSpacingMultiple: 1.0 });
  // KBW official-partner badge
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 0.7, y: 2.7, w: 6.2, h: 0.46, rectRadius: 0.06, fill: { color: C.bg2 }, line: { color: C.lime, width: 0.75 } });
  s.addText("★  OFFICIAL PARTNER · KOREA BLOCKCHAIN WEEK · SINCE 2023", { x: 0.7, y: 2.7, w: 6.2, h: 0.46, margin: 0, align: "center", valign: "middle", fontFace: F.mono, fontSize: 9, color: C.lime, charSpacing: 1 });
  s.addText("PROOF is the Web3 event agency of Chris & Partners — a Seoul-based professional organizer with 15 years of international operations. Global projects hand us the brief; we deliver the event — side party, VIP reception, sponsor activation or full conference — from Seoul to Bangkok to Singapore. We know the venues, the vendors and the variables before you brief us.", { x: 0.7, y: 3.45, w: 6.9, h: 1.8, margin: 0, fontFace: F.body, fontSize: 15, color: C.w, lineSpacingMultiple: 1.3 });
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
   ["Client-first", "Your brief, your brand — from a VIP dinner to a full conference.", C.mag],
   ["End to end", "Brief to on-site — run-of-show, AV, staffing, the variables.", C.blue]].forEach((col, i) => {
    const cx = 0.7 + i * 4.0;
    s.addShape(p.shapes.RECTANGLE, { x: cx, y: 4.7, w: 0.42, h: 0.05, fill: { color: col[2] } });
    s.addText(col[0], { x: cx, y: 4.9, w: 3.7, h: 0.5, margin: 0, fontFace: F.serif, fontSize: 21, color: C.w });
    s.addText(col[1], { x: cx, y: 5.5, w: 3.7, h: 1.0, margin: 0, fontFace: F.body, fontSize: 12.5, color: C.mut, lineSpacingMultiple: 1.28 });
  });
  footer(s); pageNum(s, 4);

  // SELECTED WORK — contents: 4 in depth + breadth
  s = p.addSlide(); s.background = { color: C.bg };
  kicker(s, "SELECTED WORK", 0.7, 0.7);
  const shown = heroes.length + owned.length + moreFinal.length;
  s.addText([{ text: shown + " events. ", options: { color: C.w } }, { text: "Four in depth.", options: { color: C.lime } }], { x: 0.66, y: 1.12, w: 11.5, h: 0.9, margin: 0, fontFace: F.serif, fontSize: 32 });
  s.addText("IN DEPTH", { x: 0.7, y: 2.4, w: 5, h: 0.3, margin: 0, fontFace: F.mono, fontSize: 9, color: C.mut, charSpacing: 2 });
  heroes.forEach((c, i) => {
    const y = 2.85 + i * 0.92, acc = ACC[c.accent] || C.lime;
    s.addText(String(i + 1).padStart(2, "0"), { x: 0.7, y: y + 0.05, w: 0.6, h: 0.5, margin: 0, fontFace: F.mono, fontSize: 14, color: acc });
    s.addText(c.title, { x: 1.32, y, w: 4.6, h: 0.45, margin: 0, fontFace: F.serif, fontSize: 18, color: C.w, fit: "shrink" });
    s.addText((SCOPE[c.scope] || "Web3 Event").toUpperCase(), { x: 1.32, y: y + 0.42, w: 4.6, h: 0.28, margin: 0, fontFace: F.mono, fontSize: 8, color: C.mut, charSpacing: 1 });
    s.addShape(p.shapes.LINE, { x: 0.7, y: y + 0.78, w: 5.2, h: 0, line: { color: C.line, width: 0.5 } });
  });
  s.addText("ALSO INSIDE", { x: 6.75, y: 2.4, w: 6, h: 0.3, margin: 0, fontFace: F.mono, fontSize: 9, color: C.mut, charSpacing: 2 });
  s.addText("Owned flagship", { x: 6.75, y: 2.82, w: 6, h: 0.4, margin: 0, fontFace: F.serif, fontSize: 18, color: C.w });
  s.addText("Seoul Meta Week — " + owned.length + " editions, 2021–2025", { x: 6.75, y: 3.28, w: 6, h: 0.3, margin: 0, fontFace: F.mono, fontSize: 9.5, color: C.mag, charSpacing: 0.5 });
  s.addText("More client work", { x: 6.75, y: 4.05, w: 6, h: 0.4, margin: 0, fontFace: F.serif, fontSize: 18, color: C.w });
  s.addText(moreFinal.map((c) => c.title).join("   ·   "), { x: 6.75, y: 4.5, w: 5.9, h: 1.6, margin: 0, fontFace: F.mono, fontSize: 9.5, color: C.mut, lineSpacingMultiple: 1.5 });
  footer(s); pageNum(s, 5);

  // HERO CASES — 4 full-page, agency-first client work
  let pg = 6;
  heroes.forEach((c, i) => {
    const sl = p.addSlide(); sl.background = { color: C.bg };
    const acc = ACC[c.accent] || C.lime;
    const hero = heroBy[c.sanitySlug];
    if (hero) { sl.addImage({ path: hero, x: 0, y: 0, w: 6.9, h: H, sizing: { type: "cover", w: 6.9, h: H } }); dark(sl, 0, 0, 6.9, H, 32); dark(sl, 0, H - 1.4, 6.9, 1.4, 12); }
    else { sl.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: 6.9, h: H, fill: { color: C.bg2 } }); }
    sl.addText([{ text: "CASE ", options: { color: C.w } }, { text: String(i + 1).padStart(2, "0"), options: { color: acc } }, { text: " / " + String(heroes.length).padStart(2, "0"), options: { color: C.mut } }], { x: 0.5, y: H - 0.72, w: 3, h: 0.32, margin: 0, fontFace: F.mono, fontSize: 11, charSpacing: 1 });
    const rx = 7.35, rw = 5.45;
    kicker(sl, (SCOPE[c.scope] || "Web3 Event").toUpperCase(), rx, 0.78, acc);
    sl.addText(c.title, { x: rx - 0.04, y: 1.16, w: rw, h: 1.35, margin: 0, fontFace: F.serif, fontSize: 29, color: C.w, lineSpacingMultiple: 0.97, fit: "shrink" });
    sl.addText(metaLine(c).toUpperCase(), { x: rx, y: 2.58, w: rw, h: 0.4, margin: 0, fontFace: F.mono, fontSize: 9.5, color: C.mut, charSpacing: 0.5 });
    sl.addText(c.summary, { x: rx, y: 3.08, w: rw - 0.05, h: 1.55, margin: 0, fontFace: F.body, fontSize: 13, color: C.w, lineSpacingMultiple: 1.28 });
    (c.kpis || []).slice(0, 3).forEach((k, j) => {
      const kx = rx + j * (rw / 3);
      sl.addText(String(k.value), { x: kx, y: 4.82, w: rw / 3 - 0.12, h: 0.55, margin: 0, fontFace: F.serif, fontSize: 21, color: acc, fit: "shrink" });
      sl.addText(String(k.label).toUpperCase(), { x: kx, y: 5.42, w: rw / 3 - 0.12, h: 0.5, margin: 0, fontFace: F.mono, fontSize: 8, color: C.mut, charSpacing: 0.5, lineSpacingMultiple: 0.96 });
    });
    if (c.scopeItems && c.scopeItems.length) {
      sl.addText("SCOPE", { x: rx, y: 6.08, w: rw, h: 0.28, margin: 0, fontFace: F.mono, fontSize: 8, color: acc, charSpacing: 2 });
      sl.addText(c.scopeItems.join("   ·   "), { x: rx, y: 6.34, w: rw, h: 0.5, margin: 0, fontFace: F.mono, fontSize: 9, color: C.mut, charSpacing: 0.2, fit: "shrink" });
    }
    if (c.quote) {
      sl.addText("“" + c.quote.text + "”", { x: rx, y: 6.85, w: rw, h: 0.5, margin: 0, fontFace: F.serif, italic: true, fontSize: 11, color: "E6E2DB", lineSpacingMultiple: 1.1, fit: "shrink" });
    }
    pageNum(sl, pg++);
  }); // end heroes

  // OWNED FLAGSHIP — Seoul Meta Week lineage (capability proof, not the lead)
  s = p.addSlide(); s.background = { color: C.bg };
  kicker(s, "OUR OWN FLAGSHIP", 0.7, 0.7, C.mag);
  s.addText([{ text: "We don't only run clients' events — ", options: { color: C.w } }, { text: "we built our own.", options: { color: C.mag } }], { x: 0.66, y: 1.12, w: 12, h: 0.9, margin: 0, fontFace: F.serif, fontSize: 30 });
  s.addText("Seoul Meta Week — " + owned.length + " editions, 2021–2025. Proof we can produce and scale a 1,500-person summit end to end, not just a side event.", { x: 0.7, y: 2.05, w: 11.8, h: 0.8, margin: 0, fontFace: F.body, fontSize: 14, color: C.mut, lineSpacingMultiple: 1.3 });
  owned.forEach((c, i) => {
    const cardW = 2.15, x = 0.7 + i * (cardW + 0.235), cy = 3.1;
    const hImg = heroBy[c.sanitySlug];
    if (hImg) { s.addImage({ path: hImg, x, y: cy, w: cardW, h: 1.95, sizing: { type: "cover", w: cardW, h: 1.95 } }); dark(s, x, cy, cardW, 1.95, 18); }
    else { s.addShape(p.shapes.RECTANGLE, { x, y: cy, w: cardW, h: 1.95, fill: { color: C.bg2 } }); }
    const yr = (c.title.match(/(\d{4})/) || [])[1] || "";
    s.addText(yr, { x, y: cy + 2.05, w: cardW, h: 0.5, margin: 0, fontFace: F.serif, fontSize: 22, color: C.mag });
    const k = (c.kpis || [])[0];
    if (k) {
      s.addText(String(k.value), { x, y: cy + 2.62, w: cardW, h: 0.4, margin: 0, fontFace: F.serif, fontSize: 15, color: C.w, fit: "shrink" });
      s.addText(String(k.label).toUpperCase(), { x, y: cy + 3.02, w: cardW, h: 0.35, margin: 0, fontFace: F.mono, fontSize: 7.5, color: C.mut, charSpacing: 0.5 });
    }
  });
  footer(s); pageNum(s, pg++);

  // MORE CLIENT WORK — breadth grid
  s = p.addSlide(); s.background = { color: C.bg };
  kicker(s, "MORE CLIENT WORK", 0.7, 0.7, C.blue);
  s.addText([{ text: "A deeper ", options: { color: C.w } }, { text: "bench.", options: { color: C.lime } }], { x: 0.66, y: 1.12, w: 11.5, h: 0.9, margin: 0, fontFace: F.serif, fontSize: 30 });
  s.addText("Selected from 150+ events — activations, mixers, hackathons and roadshows across the region.", { x: 0.7, y: 2.05, w: 11.8, h: 0.6, margin: 0, fontFace: F.body, fontSize: 14, color: C.mut, lineSpacingMultiple: 1.3 });
  moreFinal.slice(0, 5).forEach((c, i) => {
    const cardW = 2.15, x = 0.7 + i * (cardW + 0.235), cy = 3.05, acc = ACC[c.accent] || C.lime;
    const hImg = heroBy[c.sanitySlug];
    if (hImg) { s.addImage({ path: hImg, x, y: cy, w: cardW, h: 1.7, sizing: { type: "cover", w: cardW, h: 1.7 } }); dark(s, x, cy, cardW, 1.7, 22); }
    else { s.addShape(p.shapes.RECTANGLE, { x, y: cy, w: cardW, h: 1.7, fill: { color: C.bg2 } }); }
    s.addText(c.title, { x, y: cy + 1.82, w: cardW, h: 0.68, margin: 0, fontFace: F.serif, fontSize: 12.5, color: C.w, lineSpacingMultiple: 0.95, fit: "shrink" });
    s.addText((SCOPE[c.scope] || "Web3 Event").toUpperCase(), { x, y: cy + 2.5, w: cardW, h: 0.28, margin: 0, fontFace: F.mono, fontSize: 7, color: acc, charSpacing: 1 });
    const k = (c.kpis || [])[0];
    if (k) s.addText(String(k.value) + "  ·  " + String(k.label), { x, y: cy + 2.82, w: cardW, h: 0.35, margin: 0, fontFace: F.mono, fontSize: 7.5, color: C.mut, fit: "shrink" });
  });
  footer(s); pageNum(s, pg++);

  // CLIENTS & OPERATING AT
  s = p.addSlide(); s.background = { color: C.bg };
  kicker(s, "CLIENTS & PARTNERS", 0.7, 0.7);
  ["Polygon", "Sahara AI", "BitGo", "Gensyn", "Hashed", "TV Chosun", "Hashkey", "TokenPost", "WEMIX", "AEON Protocol", "Solana", "Glosfer"].forEach((cl, i) => {
    const col = i % 4, row = Math.floor(i / 4), x = 0.7 + col * 3.1, y = 1.2 + row * 0.86;
    s.addShape(p.shapes.RECTANGLE, { x, y, w: 2.98, h: 0.74, fill: { color: C.bg2 }, line: { color: C.line, width: 0.75 } });
    s.addText(cl.toUpperCase(), { x, y, w: 2.98, h: 0.74, margin: 0, align: "center", valign: "middle", fontFace: F.mono, fontSize: 12.5, color: C.w, charSpacing: 1 });
  });
  // KBW official partnership — headline credential
  kicker(s, "OFFICIAL PARTNER", 0.7, 4.35, C.lime);
  s.addText([{ text: "Korea Blockchain Week ", options: { color: C.lime } }, { text: "— official partner since 2023.", options: { color: C.w } }], { x: 0.66, y: 4.68, w: 12, h: 0.7, margin: 0, fontFace: F.serif, italic: true, fontSize: 28 });
  kicker(s, "ALSO OPERATING AT", 0.7, 5.65, C.mag);
  const ev = ["TOKEN2049", "Seoul Meta Week", "Aggregation Summit", "Polygon Connect", "Consensus Asia", "EthDenver", "DevCon"];
  s.addText(ev.map((e, i) => ({ text: e + (i < ev.length - 1 ? "   ✳   " : ""), options: { color: i % 2 ? C.w : C.mag } })), { x: 0.66, y: 5.98, w: 12, h: 1.0, margin: 0, fontFace: F.serif, italic: true, fontSize: 20, lineSpacingMultiple: 1.1 });
  footer(s); pageNum(s, pg++);

  // PROPOSAL — format-led tiers (menu + 4 detail), shared PACKAGES
  const accHex = (k) => ACC[k] || C.lime;
  s = p.addSlide(); s.background = { color: C.bg };
  kicker(s, "WORK WITH US", 0.7, 0.7, C.mag);
  s.addText([{ text: "Four ways to start. ", options: { color: C.w } }, { text: "Pick your moment.", options: { color: C.lime } }], { x: 0.66, y: 1.05, w: 12, h: 0.9, margin: 0, fontFace: F.serif, fontSize: 34 });
  PACKAGES.forEach((pk, i) => {
    const cardW = 2.795, x = 0.7 + i * (cardW + 0.25), cy = 2.5, cardH = 3.7, acc = accHex(pk.acc), ink = pk.invert;
    if (ink) s.addShape(p.shapes.RECTANGLE, { x, y: cy, w: cardW, h: cardH, fill: { color: C.lime } });
    else { s.addShape(p.shapes.RECTANGLE, { x, y: cy, w: cardW, h: cardH, fill: { color: C.bg2 }, line: { color: C.line, width: 0.75 } }); s.addShape(p.shapes.RECTANGLE, { x, y: cy, w: cardW, h: 0.08, fill: { color: acc } }); }
    s.addText(pk.name, { x: x + 0.18, y: cy + 0.24, w: cardW - 0.36, h: 0.7, margin: 0, fontFace: F.serif, fontSize: 15, color: ink ? C.ink : C.w, bold: ink });
    s.addText(pk.budget, { x: x + 0.18, y: cy + 1.0, w: cardW - 0.36, h: 0.6, margin: 0, fontFace: F.serif, fontSize: 24, color: ink ? C.ink : acc, bold: ink });
    s.addText(pk.scale.toUpperCase(), { x: x + 0.18, y: cy + 1.62, w: cardW - 0.36, h: 0.3, margin: 0, fontFace: F.mono, fontSize: 8.5, color: ink ? C.ink : C.mut });
    s.addText(pk.what, { x: x + 0.18, y: cy + 2.05, w: cardW - 0.36, h: 1.4, margin: 0, fontFace: F.body, fontSize: 10.5, color: ink ? C.ink : "D9D5CE", lineSpacingMultiple: 1.18 });
  });
  s.addText("Indicative ranges (USD) · scoped to your brief · à-la-carte add-ons (after-party · hybrid livestream · content & recap · VIP transport). Overseas markets quoted on request.", { x: 0.7, y: 6.5, w: 12, h: 0.5, margin: 0, fontFace: F.mono, fontSize: 9, color: C.mut });
  footer(s); pageNum(s, pg++);

  PACKAGES.forEach((pk, i) => {
    const acc = accHex(pk.acc), img = heroForSlug(pk.proofSlug);
    const sl = p.addSlide(); sl.background = { color: pk.invert ? C.lime : C.bg };
    if (pk.invert) {
      if (img) sl.addImage({ path: img, x: 7.85, y: 0, w: 5.483, h: H, sizing: { type: "cover", w: 5.483, h: H } });
      kicker(sl, "PROPOSAL · 04 / 04", 0.7, 0.9, C.ink);
      sl.addText(pk.name, { x: 0.66, y: 1.3, w: 6.7, h: 1.0, margin: 0, fontFace: F.serif, fontSize: 30, color: C.ink, bold: true, lineSpacingMultiple: 0.98 });
      sl.addText(pk.budget, { x: 0.7, y: 2.45, w: 6.6, h: 0.8, margin: 0, fontFace: F.serif, fontSize: 44, color: C.ink, bold: true });
      sl.addText(pk.what, { x: 0.7, y: 3.4, w: 6.5, h: 0.8, margin: 0, fontFace: F.body, fontSize: 14, color: C.ink, lineSpacingMultiple: 1.25 });
      pk.inc.forEach((it, j) => { const iy = 4.35 + j * 0.42; sl.addShape(p.shapes.RECTANGLE, { x: 0.7, y: iy + 0.06, w: 0.12, h: 0.12, fill: { color: C.ink } }); sl.addText(it, { x: 0.98, y: iy, w: 6, h: 0.35, margin: 0, fontFace: F.body, fontSize: 12.5, color: C.ink }); });
      sl.addText(pk.scale + "  ·  " + pk.time, { x: 0.7, y: 6.25, w: 6.6, h: 0.3, margin: 0, fontFace: F.mono, fontSize: 10, color: C.ink });
      sl.addText("PROOF — " + pk.proof, { x: 0.7, y: 6.6, w: 6.6, h: 0.3, margin: 0, fontFace: F.mono, fontSize: 10, color: C.ink });
    } else {
      if (img) { sl.addImage({ path: img, x: 0, y: 0, w: 6.9, h: H, sizing: { type: "cover", w: 6.9, h: H } }); dark(sl, 0, 0, 6.9, H, 30); dark(sl, 0, H - 1.4, 6.9, 1.4, 12); }
      else sl.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: 6.9, h: H, fill: { color: C.bg2 } });
      sl.addText([{ text: "PROPOSAL ", options: { color: C.w } }, { text: String(i + 1).padStart(2, "0"), options: { color: acc } }, { text: " / 04", options: { color: C.mut } }], { x: 0.5, y: H - 0.72, w: 3, h: 0.32, margin: 0, fontFace: F.mono, fontSize: 11, charSpacing: 1 });
      const rx = 7.35, rw = 5.45;
      kicker(sl, "PROPOSAL · STARTING POINT", rx, 0.85, acc);
      sl.addText(pk.name, { x: rx - 0.04, y: 1.25, w: rw, h: 1.0, margin: 0, fontFace: F.serif, fontSize: 26, color: C.w, lineSpacingMultiple: 0.98 });
      sl.addShape(p.shapes.ROUNDED_RECTANGLE, { x: rx, y: 2.5, w: 2.0, h: 0.6, rectRadius: 0.06, fill: { color: acc } });
      sl.addText(pk.budget, { x: rx, y: 2.5, w: 2.0, h: 0.6, margin: 0, align: "center", valign: "middle", fontFace: F.serif, fontSize: 21, color: pk.acc === "c1" ? C.ink : "FFFFFF", bold: true });
      sl.addText(pk.what, { x: rx, y: 3.35, w: rw - 0.1, h: 0.9, margin: 0, fontFace: F.body, fontSize: 13, color: C.w, lineSpacingMultiple: 1.25 });
      pk.inc.forEach((it, j) => { const iy = 4.4 + j * 0.42; sl.addShape(p.shapes.RECTANGLE, { x: rx, y: iy + 0.06, w: 0.12, h: 0.12, fill: { color: acc } }); sl.addText(it, { x: rx + 0.28, y: iy, w: rw - 0.3, h: 0.35, margin: 0, fontFace: F.body, fontSize: 12.5, color: C.w }); });
      sl.addText(pk.scale + "  ·  " + pk.time, { x: rx, y: 6.2, w: rw, h: 0.3, margin: 0, fontFace: F.mono, fontSize: 10, color: C.mut });
      sl.addText("PROOF — " + pk.proof, { x: rx, y: 6.55, w: rw, h: 0.3, margin: 0, fontFace: F.mono, fontSize: 10, color: acc });
    }
    pageNum(sl, pg++);
  });

  // CONTACT
  s = p.addSlide(); s.background = { color: C.bg };
  const closing = heroBy["서울메타위크2025-reimagine-what-is-possible-copy"]; if (closing) { full(s, closing); dark(s, 0, 0, W, H, 28); }
  kicker(s, "LET'S TALK", 0.72, 1.45);
  s.addText([{ text: "Take your project to the ", options: { color: C.w } }, { text: "world stage.", options: { color: C.lime } }], { x: 0.66, y: 1.85, w: 11.5, h: 2.2, margin: 0, fontFace: F.serif, fontSize: 48, lineSpacingMultiple: 1.0 });
  s.addText([{ text: "hello@chrisandpartners.co", options: { breakLine: true, color: C.w, bold: true } }, { text: "+82-2-375-4620", options: { breakLine: true, color: C.w } }, { text: "proof.chrisandpartners.co", options: { color: C.lime } }], { x: 0.7, y: 4.5, w: 7, h: 1.6, margin: 0, fontFace: F.mono, fontSize: 15, lineSpacingMultiple: 1.5 });
  s.addText("PROOF — by Chris & Partners  ·  5F DSM Square, 45 Dokmak-ro 3-gil, Mapo-gu, Seoul, Republic of Korea", { x: 0.72, y: 6.7, w: 12, h: 0.4, margin: 0, fontFace: F.mono, fontSize: 10, color: "CFCBC4", charSpacing: 0.5 });

  fs.mkdirSync(path.join(ROOT, "deck"), { recursive: true });
  await p.writeFile({ fileName: path.join(ROOT, "deck", "PROOF-Portfolio-2026.pptx") });
  console.log(`Deck written — ${heroes.length} hero cases + ${owned.length} owned + ${moreFinal.length} more (of ${allCases.length} total) from proof-cases.json + Sanity images.`);
})();
