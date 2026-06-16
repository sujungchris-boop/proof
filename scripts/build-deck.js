#!/usr/bin/env node
/* Single source -> PDF/deck. Reads the SAME cases/cases.json the website
   uses (scripts/build-cases.js) and renders the case slides from it, so the
   deck never drifts from the site. Outputs an editable .pptx to dist/.
   Run: npm run build:deck   (then export PDF from PowerPoint/Keynote). */
const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const IMG = path.join(ROOT, "images") + "/";
const img = (heroPath) => IMG + path.basename(heroPath); // "/images/x.jpg" -> ".../images/x.jpg"
const cases = JSON.parse(fs.readFileSync(path.join(ROOT, "cases/cases.json"), "utf8"))
  .sort((a, b) => (a.order || 99) - (b.order || 99));

const C = { bg: "151515", bg2: "1F1F1F", ink: "111107", w: "F4F1EC", mut: "9A9A9A", line: "3A3A3A", lime: "D6FF3F", mag: "FF3D9A", blue: "5B8CFF" };
const ACC = { c1: C.lime, c2: C.mag, c3: C.blue };
const F = { serif: "Georgia", mono: "Consolas", body: "Calibri" };

const p = new pptxgen();
p.defineLayout({ name: "W", width: 13.333, height: 7.5 });
p.layout = "W";
p.author = "PROOF — by Chris & Partners";
p.title = "PROOF — Portfolio 2026";
const W = 13.333, H = 7.5;

const kicker = (s, txt, x, y, color = C.lime) => s.addText(txt, { x, y, w: 9, h: 0.3, margin: 0, fontFace: F.mono, fontSize: 11.5, color, charSpacing: 2 });
const pageNum = (s, n) => s.addText(String(n).padStart(2, "0"), { x: W - 1.1, y: H - 0.55, w: 0.8, h: 0.3, margin: 0, align: "right", fontFace: F.mono, fontSize: 10, color: C.mut });
const dark = (s, x, y, w, h, t) => s.addShape(p.shapes.RECTANGLE, { x, y, w, h, fill: { color: "0E0E0E", transparency: t } });
const fullImg = (s, file) => s.addImage({ path: file, x: 0, y: 0, w: W, h: H, sizing: { type: "cover", w: W, h: H } });
const metaLine = (c) => [c.client, c.date, c.city && c.venue ? `${c.venue}, ${c.city}` : (c.venue || c.city)].filter((x) => x && x !== "—").join("  ·  ");

let s;
// 1 — COVER
s = p.addSlide(); s.background = { color: C.bg }; fullImg(s, img("/images/hero.jpeg")); dark(s, 0, 0, W, H, 55);
s.addText("PROOF", { x: 0.7, y: 0.55, w: 4, h: 0.6, margin: 0, fontFace: F.serif, fontSize: 26, bold: true, color: C.w, charSpacing: 2 });
kicker(s, "WEB3 EVENT AGENCY  ·  BY CHRIS & PARTNERS  ·  SEOUL", 0.72, 3.45);
s.addText([{ text: "Global Stages.", options: { breakLine: true, color: C.w } }, { text: "Proven ", options: { color: C.lime } }, { text: "Execution.", options: { color: C.w } }], { x: 0.66, y: 3.75, w: 11, h: 2.1, margin: 0, fontFace: F.serif, italic: true, fontSize: 60, lineSpacingMultiple: 0.96 });
s.addText("Portfolio  ·  2026", { x: 0.72, y: 6.55, w: 6, h: 0.4, margin: 0, fontFace: F.mono, fontSize: 12, color: C.mut, charSpacing: 1 });

// 2 — WHO WE ARE
s = p.addSlide(); s.background = { color: C.bg };
s.addImage({ path: img("/images/about.jpg"), x: 8.2, y: 0, w: 5.133, h: H, sizing: { type: "cover", w: 5.133, h: H } }); dark(s, 8.2, 0, 5.133, H, 72);
kicker(s, "01 — WHO WE ARE", 0.7, 0.7);
s.addText([{ text: "The Web3 division of", options: { breakLine: true, color: C.w } }, { text: "Chris & Partners.", options: { color: C.lime } }], { x: 0.66, y: 1.15, w: 7.2, h: 1.8, margin: 0, fontFace: F.serif, fontSize: 40, lineSpacingMultiple: 1.0 });
s.addText("PROOF is the Web3-native arm of Chris & Partners — a Seoul-based professional event organizer with 15 years of international operations. We've produced Seoul Meta Week from its first edition, run the Sahara AI Connect Party at Korea Blockchain Week, and delivered side events at TOKEN2049 Singapore. We know the venues, the vendors and the variables — before you brief us.", { x: 0.7, y: 3.05, w: 6.9, h: 1.9, margin: 0, fontFace: F.body, fontSize: 15.5, color: C.w, lineSpacingMultiple: 1.3 });
[["150+", "Events organized"], ["15yr", "PCO track record"], ["Global", "Event operations"], ["Seoul", "Headquarters"]].forEach((st, i) => {
  const sx = 0.7 + i * 1.78;
  s.addText(st[0], { x: sx, y: 5.45, w: 1.7, h: 0.7, margin: 0, fontFace: F.serif, fontSize: 33, color: C.lime });
  s.addText(st[1].toUpperCase(), { x: sx, y: 6.18, w: 1.7, h: 0.5, margin: 0, fontFace: F.mono, fontSize: 9.5, color: C.mut, charSpacing: 1 });
});
pageNum(s, 2);

// 3 — WHAT WE DO
s = p.addSlide(); s.background = { color: C.bg };
kicker(s, "02 — WHAT WE DO", 0.7, 0.62);
s.addText("What we do.", { x: 0.66, y: 1.02, w: 9, h: 1.0, margin: 0, fontFace: F.serif, fontSize: 40, color: C.w });
[["expertise-01.jpg", "Conferences & Summits", "Full production for our own summits — Seoul Meta Week, Aggregation Summit."],
 ["expertise-02.jpg", "Side Events & Activations", "TOKEN2049, KBW, Consensus. Venue, branding, AV, on-site staffing."],
 ["expertise-03.jpg", "Private Dinners & VIP", "Curated events for investor relations and strategic partnerships."],
 ["expertise-04.jpg", "Korea Market Entry", "Full PCO for global Web3 projects entering the Korean market."]].forEach((c, i) => {
  const cardW = 2.92, cardH = 3.55, x = 0.7 + i * (cardW + 0.3), cardY = 2.5;
  s.addImage({ path: IMG + c[0], x, y: cardY, w: cardW, h: cardH, sizing: { type: "cover", w: cardW, h: cardH } });
  dark(s, x, cardY, cardW, cardH, 30); dark(s, x, cardY + cardH - 1.7, cardW, 1.7, 16);
  s.addText("0" + (i + 1), { x: x + 0.18, y: cardY + 0.16, w: 1, h: 0.4, margin: 0, fontFace: F.mono, fontSize: 11, color: C.lime });
  s.addText(c[1], { x: x + 0.18, y: cardY + cardH - 1.62, w: cardW - 0.36, h: 0.8, margin: 0, fontFace: F.serif, fontSize: 17.5, color: C.w, lineSpacingMultiple: 0.98 });
  s.addText(c[2], { x: x + 0.18, y: cardY + cardH - 0.78, w: cardW - 0.36, h: 0.7, margin: 0, fontFace: F.body, fontSize: 11, color: "D9D5CE", lineSpacingMultiple: 1.1 });
});
pageNum(s, 3);

// 4 — THE GAP
s = p.addSlide(); s.background = { color: C.bg }; fullImg(s, img("/images/cta.jpg")); dark(s, 0, 0, W, H, 32);
kicker(s, "03 — THE GAP WE FILL", 0.72, 1.5);
s.addText([{ text: "Your project is ready for the global stage.", options: { breakLine: true, color: C.w } }, { text: "The problem isn't ambition — ", options: { color: C.w } }, { text: "it's execution.", options: { color: C.lime } }], { x: 0.66, y: 2.1, w: 11.6, h: 3, margin: 0, fontFace: F.serif, fontSize: 44, lineSpacingMultiple: 1.08 });
s.addText("Booking a venue in Singapore, staffing an event in Dubai, navigating a Korean venue contract — these are not things you figure out two weeks before the conference. PROOF exists for exactly this.", { x: 0.7, y: 5.5, w: 9.2, h: 1.3, margin: 0, fontFace: F.body, fontSize: 15, color: "E6E2DB", lineSpacingMultiple: 1.3 });
pageNum(s, 4);

// CASE SLIDES — driven by cases/cases.json (single source, shared with the website)
let pg = 5;
for (const c of cases) {
  const sl = p.addSlide(); sl.background = { color: C.bg };
  const acc = ACC[c.accent] || C.lime;
  sl.addImage({ path: img(c.hero), x: 0, y: 0, w: 7.0, h: H, sizing: { type: "cover", w: 7.0, h: H } });
  dark(sl, 0, 0, 7.0, H, 78);
  const rx = 7.55;
  kicker(sl, "SELECTED WORK · " + c.tag.toUpperCase(), rx, 1.0, acc);
  sl.addText(c.title, { x: rx - 0.04, y: 1.4, w: 5.4, h: 1.3, margin: 0, fontFace: F.serif, fontSize: 32, color: C.w, lineSpacingMultiple: 0.98 });
  sl.addText(metaLine(c).toUpperCase(), { x: rx, y: 2.72, w: 5.5, h: 0.4, margin: 0, fontFace: F.mono, fontSize: 10.5, color: acc, charSpacing: 0.5 });
  sl.addText(c.summary, { x: rx, y: 3.25, w: 5.2, h: 1.3, margin: 0, fontFace: F.body, fontSize: 13.5, color: C.w, lineSpacingMultiple: 1.28 });
  const m = (c.metrics || [])[0];
  if (m) {
    sl.addText(m.value, { x: rx, y: 4.65, w: 5.2, h: 0.7, margin: 0, fontFace: F.serif, fontSize: 30, color: acc });
    sl.addText(String(m.label).toUpperCase(), { x: rx, y: 5.35, w: 5.2, h: 0.35, margin: 0, fontFace: F.mono, fontSize: 9.5, color: C.mut, charSpacing: 1 });
  }
  if (c.quote) {
    sl.addText("“" + c.quote.text + "”", { x: rx, y: 5.95, w: 5.3, h: 1.0, margin: 0, fontFace: F.serif, italic: true, fontSize: 13.5, color: "E6E2DB", lineSpacingMultiple: 1.2 });
    sl.addText("— " + c.quote.attrib, { x: rx, y: 6.9, w: 5.3, h: 0.3, margin: 0, fontFace: F.mono, fontSize: 9.5, color: C.mut, charSpacing: 1 });
  }
  pageNum(sl, pg++);
}

// CLIENTS & OPERATING AT
s = p.addSlide(); s.background = { color: C.bg };
kicker(s, "CLIENTS & PARTNERS", 0.7, 0.7);
["Hashkey", "AlchemyPay", "WEMIX", "Polygon", "AEON Protocol", "Sahara AI", "Danal", "PayCoin", "Solana", "Open Ledger", "Bitgo", "Factblock"].forEach((cl, i) => {
  const col = i % 4, row = Math.floor(i / 4), x = 0.7 + col * 3.1, y = 1.25 + row * 0.92;
  s.addShape(p.shapes.RECTANGLE, { x, y, w: 2.98, h: 0.8, fill: { color: C.bg2 }, line: { color: C.line, width: 0.75 } });
  s.addText(cl.toUpperCase(), { x, y, w: 2.98, h: 0.8, margin: 0, align: "center", valign: "middle", fontFace: F.mono, fontSize: 12.5, color: C.w, charSpacing: 1 });
});
kicker(s, "OPERATING AT", 0.7, 4.65, C.mag);
const ev = ["Korea Blockchain Week", "TOKEN2049", "DevCon", "EthDenver", "Consensus Asia", "Seoul Meta Week", "Aggregation Summit", "AI All Summit"];
s.addText(ev.map((e, i) => ({ text: e + (i < ev.length - 1 ? "   ✳   " : ""), options: { color: i % 2 ? C.w : C.lime } })), { x: 0.66, y: 5.15, w: 12, h: 1.6, margin: 0, fontFace: F.serif, italic: true, fontSize: 26, lineSpacingMultiple: 1.15 });
pageNum(s, pg++);

// CONTACT
s = p.addSlide(); s.background = { color: C.bg }; fullImg(s, img("/images/work-02.jpg")); dark(s, 0, 0, W, H, 22);
kicker(s, "LET'S TALK", 0.72, 1.45);
s.addText([{ text: "Take your project to the ", options: { color: C.w } }, { text: "world stage.", options: { color: C.lime } }], { x: 0.66, y: 1.85, w: 11.5, h: 2.2, margin: 0, fontFace: F.serif, fontSize: 48, lineSpacingMultiple: 1.0 });
s.addText([{ text: "hello@chrisandpartners.co", options: { breakLine: true, color: C.w, bold: true } }, { text: "+82-2-375-4620", options: { breakLine: true, color: C.w } }, { text: "proof.chrisandpartners.co", options: { color: C.lime } }], { x: 0.7, y: 4.5, w: 7, h: 1.6, margin: 0, fontFace: F.mono, fontSize: 15, lineSpacingMultiple: 1.5 });
s.addText("PROOF — by Chris & Partners  ·  5F DSM Square, 45 Dokmak-ro 3-gil, Mapo-gu, Seoul, Republic of Korea", { x: 0.72, y: 6.7, w: 12, h: 0.4, margin: 0, fontFace: F.mono, fontSize: 10, color: "CFCBC4", charSpacing: 0.5 });

fs.mkdirSync(path.join(ROOT, "dist"), { recursive: true });
p.writeFile({ fileName: path.join(ROOT, "dist", "PROOF-Portfolio-2026.pptx") }).then((f) => console.log("WROTE", f, "—", cases.length, "case slides from cases.json"));
