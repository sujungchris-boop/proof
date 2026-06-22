#!/usr/bin/env node
/* Single source -> shareable WEB deck. Reads the SAME curated data as the .pptx
   (scripts/deck-data.js) and emits deck/index.html, a reveal.js slide deck using
   the real site fonts/palette. Deploys with the static site (Vercel) -> a stable
   link that updates on every push. noindex + unlinked (un-exposed by default).
   Run: npm run build:deck-html */
const fs = require("fs");
const path = require("path");
const { SCOPE, ACC, loadDeck, metaLine, year } = require("./deck-data");

const ROOT = path.join(__dirname, "..");
const REV = "4.6.1";
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const accVar = { c1: "var(--lime)", c2: "var(--mag)", c3: "var(--blue)" };

function kicker(t, acc = "var(--lime)") { return `<p class="kicker" style="color:${acc}">${esc(t)}</p>`; }
function statBar(kpis, acc) {
  return `<div class="stats">` + (kpis || []).slice(0, 3).map((k) =>
    `<div class="stat"><div class="sv" style="color:${acc}">${esc(k.value)}</div><div class="sl">${esc(String(k.label).toUpperCase())}</div></div>`).join("") + `</div>`;
}
// up to 3 distinct images: hero first, then gallery
function caseImages(c) {
  const out = [], seen = new Set();
  for (const u of [c._hero, ...(c._gallery || [])]) if (u && !seen.has(u)) { seen.add(u); out.push(u); }
  return out.slice(0, 3);
}
function caseSlide(c, i, total) {
  const acc = accVar[c.accent] || "var(--lime)";
  const imgs = caseImages(c);
  const cell = (u) => u ? `<div class="cg" style="background-image:url('${u}')"></div>` : `<div class="cg noimg"></div>`;
  const mClass = imgs.length >= 3 ? "m3" : imgs.length === 2 ? "m2" : "m1";
  const mosaic = `<div class="case-mosaic ${mClass}">${imgs.map(cell).join("") || cell(null)}</div>`;
  return `<section class="case">
  <div class="case-left">${mosaic}<div class="case-fade"></div></div>
  <div class="case-tag"><b>CASE</b> <span style="color:${acc}">${String(i + 1).padStart(2, "0")}</span> / ${String(total).padStart(2, "0")}</div>
  <div class="case-body">
    ${kicker((SCOPE[c.scope] || "Web3 Event").toUpperCase(), acc)}
    <h2>${esc(c.title)}</h2>
    <p class="meta">${esc(metaLine(c).toUpperCase())}</p>
    <p class="summary">${esc(c.summary)}</p>
    ${statBar(c.kpis, acc)}
    ${c.scopeItems && c.scopeItems.length ? `<p class="scopelabel" style="color:${acc}">SCOPE</p><p class="scopeitems">${esc(c.scopeItems.join("   ·   "))}</p>` : ""}
    ${c.quote ? `<p class="quote">“${esc(c.quote.text)}”</p>` : ""}
  </div>
</section>`;
}

(async () => {
  const { allCases, heroBy, galleryBy, heroes, owned, moreFinal } = await loadDeck(ROOT);
  const heroForSlug = (slug) => { const c = allCases.find((x) => x.slug === slug); return c ? heroBy[c.sanitySlug] : null; };
  const withImg = (c) => ({ ...c, _hero: heroBy[c.sanitySlug] || null, _gallery: galleryBy[c.sanitySlug] || [] });
  const H = heroes.map(withImg), OWN = owned.map(withImg), MORE = moreFinal.map(withImg);
  const shown = H.length + OWN.length + MORE.length;

  const slides = [];

  // COVER
  slides.push(`<section class="cover" style="background-image:url('/images/hero.jpeg')">
  <div class="cover-veil"></div>
  <div class="cover-in">
    <p class="brand">PROOF</p>
    <div class="cover-head">
      ${kicker("WEB3 EVENT AGENCY  ·  BY CHRIS & PARTNERS  ·  SEOUL")}
      <h1>Global Stages.<br><em class="lime">Proven</em> Execution.</h1>
    </div>
    <p class="cover-foot">Portfolio  ·  2026</p>
  </div>
</section>`);

  // WHO WE ARE
  slides.push(`<section class="std who" style="--side:url('/images/about.jpg')">
  <div class="side"></div>
  <div class="hold">
    ${kicker("01 — WHO WE ARE")}
    <h2 class="big">A Web3 event agency,<br><span class="lime">built by Chris &amp; Partners.</span></h2>
    <p class="badge">★ OFFICIAL PARTNER · KOREA BLOCKCHAIN WEEK · SINCE 2023</p>
    <p class="lede">PROOF is the Web3 event agency of Chris &amp; Partners — a Seoul-based professional organizer with 15 years of international operations. Global projects hand us the brief; we deliver the event — side party, VIP reception, sponsor activation or full conference — from Seoul to Bangkok to Singapore.</p>
    <div class="whostats">
      ${[["150+", "Events organized"], ["15yr", "PCO track record"], ["Global", "Event operations"], ["Seoul", "Headquarters"]].map(([v, l]) => `<div><div class="sv lime">${v}</div><div class="sl">${l.toUpperCase()}</div></div>`).join("")}
    </div>
  </div>
</section>`);

  // WHAT WE DO
  const cards = [
    ["expertise-01.jpg", "Conferences & Summits", "Owned summits and full conference production for clients."],
    ["expertise-02.jpg", "Side Events & Activations", "TOKEN2049, KBW, Polygon. Venue, branding, AV, on-site staffing."],
    ["expertise-03.jpg", "Private Dinners & VIP", "Curated events for investor relations and partnerships."],
    ["expertise-04.jpg", "Korea Market Entry", "Full PCO for global Web3 projects entering Korea."],
  ];
  slides.push(`<section class="std">
  <div class="hold">
    ${kicker("02 — WHAT WE DO")}
    <h2 class="big">What we do.</h2>
    <div class="grid4">
      ${cards.map(([im, t, d], i) => `<div class="card" style="background-image:url('/images/${im}')"><div class="card-veil"></div><span class="cn">0${i + 1}</span><div class="card-tx"><h3>${esc(t)}</h3><p>${esc(d)}</p></div></div>`).join("")}
    </div>
  </div>
</section>`);

  // WHY PROOF
  const pillars = [
    ["Local ground ops", "Venues, vendors and crew secured in markets you don't operate in.", "var(--lime)"],
    ["Client-first", "Your brief, your brand — from a VIP dinner to a full conference.", "var(--mag)"],
    ["End to end", "Brief to on-site — run-of-show, AV, staffing, the variables.", "var(--blue)"],
  ];
  slides.push(`<section class="std">
  <div class="hold">
    ${kicker("03 — WHY PROOF")}
    <h2 class="big">Global teams land for the one week <span class="lime">that matters</span> — with no ground game.</h2>
    <p class="lede wide">Seoul, Singapore, Bangkok — the rooms book out, the vendors are spoken for, and the calendar doesn't move. PROOF is the operator that's already there: 150+ events across the region, the venues and suppliers on speed-dial, and the failure points mapped before you brief us.</p>
    <div class="pillars">
      ${pillars.map(([t, d, c]) => `<div class="pillar"><span class="tick" style="background:${c}"></span><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join("")}
    </div>
  </div>
</section>`);

  // SELECTED WORK — contents
  slides.push(`<section class="std">
  <div class="hold">
    ${kicker("SELECTED WORK")}
    <h2 class="big">${shown} events. <span class="lime">Four in depth.</span></h2>
    <div class="contents">
      <div class="col">
        <p class="colhead">IN DEPTH</p>
        ${H.map((c, i) => `<div class="crow"><span class="cn2" style="color:${accVar[c.accent] || "var(--lime)"}">${String(i + 1).padStart(2, "0")}</span><div><div class="ct">${esc(c.title)}</div><div class="cs">${esc((SCOPE[c.scope] || "").toUpperCase())}</div></div></div>`).join("")}
      </div>
      <div class="col">
        <p class="colhead">ALSO INSIDE</p>
        <div class="also"><h3 class="alsoh">Owned flagship</h3><p class="alsop mag">Seoul Meta Week — ${OWN.length} editions, 2021–2025</p></div>
        <div class="also"><h3 class="alsoh">More client work</h3><p class="alsop">${MORE.map((c) => esc(c.title)).join("   ·   ")}</p></div>
      </div>
    </div>
  </div>
</section>`);

  // HERO CASES
  H.forEach((c, i) => slides.push(caseSlide(c, i, H.length)));

  // OWNED FLAGSHIP strip
  slides.push(`<section class="std">
  <div class="hold">
    ${kicker("OUR OWN FLAGSHIP", "var(--mag)")}
    <h2 class="big">We don't only run clients' events — <span class="mag">we built our own.</span></h2>
    <p class="lede wide">Seoul Meta Week — ${OWN.length} editions, 2021–2025. Proof we can produce and scale a 1,500-person summit end to end, not just a side event.</p>
    <div class="strip">
      ${OWN.map((c) => { const k = (c.kpis || [])[0] || {}; return `<div class="scard"><div class="simg" ${c._hero ? `style="background-image:url('${c._hero}')"` : `class="noimg"`}></div><div class="syr mag">${esc(year(c))}</div><div class="sv">${esc(k.value || "")}</div><div class="sl">${esc(String(k.label || "").toUpperCase())}</div></div>`; }).join("")}
    </div>
  </div>
</section>`);

  // MORE CLIENT WORK grid
  slides.push(`<section class="std">
  <div class="hold">
    ${kicker("MORE CLIENT WORK", "var(--blue)")}
    <h2 class="big">A deeper <span class="lime">bench.</span></h2>
    <p class="lede wide">Selected from 150+ events — activations, mixers, hackathons and roadshows across the region.</p>
    <div class="strip">
      ${MORE.slice(0, 5).map((c) => { const acc = accVar[c.accent] || "var(--lime)"; const k = (c.kpis || [])[0] || {}; return `<div class="scard"><div class="simg" ${c._hero ? `style="background-image:url('${c._hero}')"` : `class="noimg"`}></div><div class="mt">${esc(c.title)}</div><div class="ms" style="color:${acc}">${esc((SCOPE[c.scope] || "").toUpperCase())}</div><div class="mk">${esc(k.value || "")} · ${esc(k.label || "")}</div></div>`; }).join("")}
    </div>
  </div>
</section>`);

  // CLIENTS & PARTNERS
  const logos = ["Polygon", "Sahara AI", "BitGo", "Gensyn", "Hashed", "TV Chosun", "Hashkey", "TokenPost", "WEMIX", "AEON Protocol", "Solana", "Glosfer"];
  const ev = ["TOKEN2049", "Seoul Meta Week", "Aggregation Summit", "Polygon Connect", "Consensus Asia", "EthDenver", "DevCon"];
  const lacc = { 2: "l", 5: "m", 8: "b" }; // colored cells for energy (site-style)
  slides.push(`<section class="std clients">
  <div class="hold">
    ${kicker("CLIENTS & PARTNERS")}
    <div class="logos">${logos.map((l, i) => `<div class="logo ${lacc[i] || ""}">${esc(l.toUpperCase())}</div>`).join("")}</div>
    ${kicker("OFFICIAL PARTNER")}
    <p class="kbw"><span class="lime">Korea Blockchain Week</span> — official partner since 2023.</p>
  </div>
  <div class="opatband">
    <span class="opatlabel">ALSO OPERATING AT</span>
    <span class="opatrun">${ev.map((e) => esc(e)).join(`<i>✳</i>`)}</span>
  </div>
</section>`);

  // PROPOSAL — format-led, budget embedded (deck-only copy, NOT in proof-cases.json)
  const PACKAGES = [
    { acc: "var(--blue)", cls: "b", name: "Private Dinner & VIP Reception", budget: "$10–25k", scale: "30–120 guests", time: "3–5 weeks",
      what: "An intimate, invite-only evening that turns key relationships into deals.",
      inc: ["Curated venue & styling", "F&B & hospitality", "Production & run-of-show", "On-site team"],
      proof: "BitGo VIP Reception · KBW 2023", img: heroForSlug("bitgo-vip-networking-reception") },
    { acc: "var(--mag)", cls: "m", name: "Networking Night / Side Party", budget: "$25–50k", scale: "150–350 guests", time: "5–7 weeks",
      what: "A branded night everyone's talking about — the must-attend mixer of the week.",
      inc: ["Venue & build-out", "AV, staging & lighting", "Entertainment / DJ", "Branding & staffing"],
      proof: "Gensyn ai(RL) Seoul · Polygon IGNITE", img: heroForSlug("gensyn-ai-rl-seoul") },
    { acc: "var(--lime)", cls: "l", name: "Flagship Activation", budget: "$50–100k", scale: "300–800 guests", time: "8–12 weeks",
      what: "Your headline moment of the conference week — full production, programming, overseas-capable.",
      inc: ["Marquee venue & full production", "Content & programming", "Sponsor booth (optional)", "Overseas execution & vendors"],
      proof: "Sahara Connect Party · TOKEN2049", img: heroForSlug("sahara-ai-connect-party-2025") },
    { acc: "var(--lime)", cls: "invert", name: "Conference / Summit Production", budget: "$100k+", scale: "1,000+ attendees", time: "3–6 months",
      what: "A multi-day, multi-track flagship — speakers, exhibition, the full machine.",
      inc: ["Multi-track program & speakers", "Exhibition & sponsors", "Stage, AV & broadcast", "End-to-end operations"],
      proof: "Aggregation Summit · Seoul Meta Week", img: heroForSlug("aggregation-summit-2024") },
  ];
  // menu / overview
  slides.push(`<section class="std">
  <div class="hold">
    ${kicker("WORK WITH US", "var(--mag)")}
    <h2 class="big">Four ways to start. <span class="lime">Pick your moment.</span></h2>
    <div class="pgrid">
      ${PACKAGES.map((pk) => pk.cls === "invert"
    ? `<div class="pcard pfill"><div class="pin"><div class="pname">${esc(pk.name)}</div><div class="pbudget">${esc(pk.budget)}</div><div class="pscale">${esc(pk.scale.toUpperCase())}</div><div class="pone">${esc(pk.what)}</div></div></div>`
    : `<div class="pcard"><div class="ptop" style="background:${pk.acc}"></div><div class="pin"><div class="pname">${esc(pk.name)}</div><div class="pbudget" style="color:${pk.acc}">${esc(pk.budget)}</div><div class="pscale">${esc(pk.scale.toUpperCase())}</div><div class="pone">${esc(pk.what)}</div></div></div>`).join("")}
    </div>
    <p class="pnote">Indicative ranges (USD) · scoped to your brief · à-la-carte add-ons (after-party · hybrid livestream · content & recap · VIP transport). Overseas markets quoted on request.</p>
  </div>
</section>`);
  // detail slides
  PACKAGES.forEach((pk, i) => {
    if (pk.cls === "invert") {
      slides.push(`<section class="pkg-invert">
  <div class="pi-left">
    ${kicker("PROPOSAL · 04 / 04", "rgba(14,14,10,.65)")}
    <h2 class="pkgh">${esc(pk.name)}</h2>
    <div class="ibudget">${esc(pk.budget)}</div>
    <p class="iwhat">${esc(pk.what)}</p>
    <ul class="pkgincl inv">${pk.inc.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
    <p class="pkgmeta inv">${esc(pk.scale)} · ${esc(pk.time)}</p>
    <p class="pkgproof inv">PROOF — ${esc(pk.proof)}</p>
  </div>
  <div class="pi-right" ${pk.img ? `style="background-image:url('${pk.img}')"` : ""}></div>
</section>`);
    } else {
      slides.push(`<section class="case pkg" style="--a:${pk.acc}">
  <div class="case-left"><div class="case-mosaic m1"><div class="cg" ${pk.img ? `style="background-image:url('${pk.img}')"` : `class="noimg"`}></div></div><div class="case-fade"></div></div>
  <div class="case-tag"><b>PROPOSAL</b> <span style="color:${pk.acc}">${String(i + 1).padStart(2, "0")}</span> / 04</div>
  <div class="case-body pkgbody">
    ${kicker("PROPOSAL · STARTING POINT", pk.acc)}
    <h2>${esc(pk.name)}</h2>
    <div class="budgetblock ${pk.cls}" style="background:${pk.acc}">${esc(pk.budget)}</div>
    <p class="summary">${esc(pk.what)}</p>
    <ul class="pkgincl">${pk.inc.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
    <p class="pkgmeta">${esc(pk.scale)} · ${esc(pk.time)}</p>
    <p class="pkgproof" style="color:${pk.acc}">PROOF — ${esc(pk.proof)}</p>
  </div>
</section>`);
    }
  });

  // CONTACT
  slides.push(`<section class="cover contact" style="background-image:url('/images/cta.jpg')">
  <div class="cover-veil"></div>
  <div class="cover-in">
    <div class="cover-head">
      ${kicker("LET'S TALK")}
      <h1>Take your project to the <span class="lime">world stage.</span></h1>
      <p class="contactlines"><b>hello@chrisandpartners.co</b><br>+82-2-375-4620<br><span class="lime">proof.chrisandpartners.co</span></p>
    </div>
    <p class="cover-foot">PROOF — by Chris &amp; Partners  ·  5F DSM Square, 45 Dokmak-ro 3-gil, Mapo-gu, Seoul</p>
  </div>
</section>`);

  const html = page(slides.join("\n"));
  fs.mkdirSync(path.join(ROOT, "deck"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "deck", "index.html"), html);
  console.log(`Web deck written — deck/index.html (${slides.length} slides). Open or deploy /deck/.`);
})();

function page(slidesHtml) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<meta name="robots" content="noindex, nofollow">
<title>PROOF — Portfolio 2026</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&family=IBM+Plex+Mono:wght@400;500&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@${REV}/dist/reveal.css">
<style>
:root{--bg:#121212;--bg2:#1F1F1F;--ink:#0E0E0A;--w:#F7F4EE;--w2:#CBC7BE;--mut:#8F8F8A;--line:#3A3A3A;--lime:#D6FF3F;--mag:#FF3D9A;--blue:#5B8CFF;--fn:'Fraunces',Georgia,serif;--fm:'IBM Plex Mono',monospace;--fb:'Manrope',system-ui,sans-serif}
html,body{background:var(--bg)}
.reveal{font-family:var(--fb);color:var(--w);font-weight:400}
.reveal .slides{text-align:left}
.reveal .slides section{padding:50px 64px;box-sizing:border-box;height:100%;inset:0}
.reveal h1,.reveal h2,.reveal h3{font-family:var(--fn);font-weight:600;font-optical-sizing:none;font-variation-settings:'opsz' 40;color:var(--w);text-transform:none;margin:0;letter-spacing:-.015em;line-height:1.0}
.reveal p{margin:0}
.lime{color:var(--lime)}.mag{color:var(--mag)}.blue{color:var(--blue)}
.kicker{font-family:var(--fm);font-weight:500;font-size:14px;letter-spacing:.2em;text-transform:uppercase;margin:0 0 18px}
.sv{font-family:var(--fn);font-weight:600}.sl{font-family:var(--fm);font-size:12px;color:var(--mut);letter-spacing:.08em;margin-top:5px}
.hold{width:100%}
.std .hold{position:absolute;left:64px;right:64px;top:50%;transform:translateY(-50%);width:auto}
/* COVER + CONTACT */
.cover{background-size:cover;background-position:center}
.cover .cover-veil{position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,8,8,.86),rgba(8,8,8,.5) 60%,rgba(8,8,8,.34))}
.cover .cover-in{position:relative;height:100%}
.cover .brand{position:absolute;top:0;left:0;font-family:var(--fn);font-weight:600;font-size:30px;letter-spacing:.08em}
.cover .cover-head{position:absolute;left:0;bottom:118px}
.cover h1{font-family:var(--fn);font-style:italic;font-weight:600;font-size:80px;line-height:.98}
.cover .kicker{margin-bottom:16px}
.cover .cover-foot{position:absolute;left:0;bottom:40px;font-family:var(--fm);font-size:14px;color:var(--mut);letter-spacing:.04em}
.contact .cover-veil{background:linear-gradient(0deg,rgba(8,8,8,.62),rgba(8,8,8,.78))}
.contact .cover-head{top:50%;transform:translateY(-54%);bottom:auto}
.contact h1{font-size:60px;font-style:normal}
.contact .contactlines{font-family:var(--fm);font-size:20px;line-height:2;margin-top:34px}
.contact .cover-foot{color:#CFCBC4;font-size:13px}
/* STD slides */
.big{font-size:55px;margin-bottom:24px;max-width:1080px;letter-spacing:-.02em}
.lede{font-size:21px;line-height:1.5;color:var(--w);max-width:780px}
.lede.wide{max-width:1040px;color:var(--w2)}
.who .side{position:absolute;right:0;top:0;width:31%;height:100%;background-image:var(--side);background-size:cover;background-position:center}
.who .side:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,var(--bg),rgba(21,21,21,.15) 55%,transparent)}
.who .hold{max-width:64%}
.who .big{font-size:42px}
.badge{display:inline-block;font-family:var(--fm);font-size:12px;letter-spacing:.14em;color:var(--lime);border:1px solid rgba(214,255,63,.55);border-radius:7px;padding:9px 15px;margin:4px 0 24px}
.who .lede{font-size:18px;max-width:none;color:var(--w)}
.whostats{display:flex;gap:46px;margin-top:36px}
.whostats .sv{font-size:40px}
/* WHAT grid */
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:30px;height:430px}
.card{position:relative;border-radius:5px;overflow:hidden;background-size:cover;background-position:center;display:flex;align-items:flex-end}
.card-veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,14,14,.2),rgba(14,14,14,.88))}
.card .cn{position:absolute;top:16px;left:18px;font-family:var(--fm);color:var(--lime);font-size:14px;z-index:2}
.card-tx{position:relative;padding:22px;z-index:2}.card-tx h3{font-size:22px;margin-bottom:9px;line-height:1.05}.card-tx p{font-size:13.5px;color:#D9D5CE;line-height:1.4}
/* WHY pillars */
.pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:42px;margin-top:46px;max-width:1080px}
.pillar .tick{display:block;width:36px;height:4px;border-radius:2px;margin-bottom:18px}
.pillar h3{font-size:26px;margin-bottom:12px}.pillar p{font-size:16px;color:var(--mut);line-height:1.5}
/* CONTENTS */
.contents{display:grid;grid-template-columns:1.05fr 1fr;gap:56px;margin-top:30px;align-items:start}
.colhead{font-family:var(--fm);font-size:13px;letter-spacing:.18em;color:var(--mut);margin-bottom:20px}
.crow{display:flex;gap:18px;align-items:baseline;padding:15px 0;border-bottom:1px solid var(--line)}
.cn2{font-family:var(--fm);font-size:18px}.ct{font-family:var(--fn);font-weight:600;font-size:23px}.cs{font-family:var(--fm);font-size:11.5px;color:var(--mut);letter-spacing:.08em;margin-top:5px}
.also{padding:15px 0;border-bottom:1px solid var(--line)}
.alsoh{font-size:23px;margin-bottom:8px}.alsop{font-family:var(--fm);font-size:14px;color:var(--mut);line-height:1.7}.alsop.mag{color:var(--mag)}
/* CASE */
.reveal .slides section.case{padding:0}
.case-left{position:absolute;left:0;top:0;width:53%;height:100%}
.case-mosaic{display:grid;gap:7px;width:100%;height:100%;background:var(--bg)}
.case-mosaic.m3{grid-template-columns:1fr 1fr;grid-template-rows:1.95fr 1fr}
.case-mosaic.m3 .cg:first-child{grid-column:1 / 3}
.case-mosaic.m2{grid-template-rows:1.95fr 1fr}
.case-mosaic.m1{grid-template-rows:1fr}
.cg{background-size:cover;background-position:center;background-color:var(--bg2)}
.case-fade{position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(10,10,10,.28),rgba(10,10,10,0) 26%,rgba(21,21,21,0) 72%,var(--bg) 100%)}
.case-tag{position:absolute;left:40px;bottom:34px;font-family:var(--fm);font-size:14px;color:var(--mut);letter-spacing:.06em;z-index:3}.case-tag b{color:var(--w);font-weight:400}
.case-body{position:absolute;left:57.5%;right:5%;top:50%;transform:translateY(-50%)}
.case-body h2{font-size:38px;margin:0 0 14px;line-height:1.02}
.meta{font-family:var(--fm);font-size:12.5px;color:var(--mut);letter-spacing:.06em;margin-bottom:20px}
.summary{font-size:17.5px;line-height:1.5;color:var(--w);max-width:560px}
.stats{display:flex;gap:34px;margin:32px 0 0;padding-top:22px;border-top:1px solid var(--line)}
.stats .sv{font-size:33px}
.scopelabel{font-family:var(--fm);font-size:11.5px;letter-spacing:.2em;margin:26px 0 7px}
.scopeitems{font-family:var(--fm);font-size:13px;color:var(--mut);line-height:1.5}
.quote{font-family:var(--fn);font-style:italic;font-weight:500;font-size:17px;color:#E6E2DB;margin-top:24px;max-width:560px;line-height:1.4}
/* STRIP (owned + more) */
.strip{display:grid;grid-template-columns:repeat(5,1fr);gap:18px;margin-top:36px}
.simg{height:158px;border-radius:5px;background-size:cover;background-position:center;background-color:var(--bg2)}.simg.noimg{background:var(--bg2)}
.syr{font-family:var(--fn);font-weight:600;font-size:29px;margin-top:15px}.scard .sv{font-size:19px;margin-top:4px}
.mt{font-family:var(--fn);font-weight:600;font-size:17px;margin-top:15px;line-height:1.12}.ms{font-family:var(--fm);font-size:10.5px;letter-spacing:.08em;margin-top:9px}.mk{font-family:var(--fm);font-size:11.5px;color:var(--mut);margin-top:6px}
/* CLIENTS */
.clients .hold{top:58px;transform:none}
.logos{display:grid;grid-template-columns:repeat(4,1fr);gap:13px;margin:6px 0 0}
.logo{border:1px solid var(--line);background:var(--bg2);border-radius:5px;text-align:center;padding:22px 0;font-family:var(--fm);font-size:14.5px;letter-spacing:.08em;color:var(--w)}
.logo.l{background:var(--lime);border-color:var(--lime);color:var(--ink)}
.logo.m{background:var(--mag);border-color:var(--mag);color:#fff}
.logo.b{background:var(--blue);border-color:var(--blue);color:#fff}
.clients .kicker{margin:40px 0 12px}
.kbw{font-family:var(--fn);font-style:italic;font-weight:600;font-size:34px}
.opatband{position:absolute;left:0;right:0;bottom:0;background:var(--lime);color:var(--ink);padding:17px 64px;display:flex;align-items:baseline;gap:26px;overflow:hidden}
.opatlabel{font-family:var(--fm);font-weight:500;font-size:12px;letter-spacing:.18em;flex:none}
.opatrun{font-family:var(--fn);font-style:italic;font-weight:600;font-size:24px;white-space:nowrap}.opatrun i{margin:0 14px;font-style:normal;font-size:15px;opacity:.65}
/* PACKAGES — menu */
.pgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:30px}
.pcard{background:var(--bg2);border:1px solid var(--line);border-radius:8px;overflow:hidden}
.pcard .ptop{height:7px}
.pcard .pin{padding:22px 20px}
.pname{font-family:var(--fn);font-weight:600;font-size:19px;line-height:1.1;min-height:44px}
.pbudget{font-family:var(--fn);font-weight:700;font-size:29px;margin:12px 0 5px}
.pscale{font-family:var(--fm);font-size:11px;letter-spacing:.1em;color:var(--mut)}
.pone{font-size:13.5px;color:var(--w2);line-height:1.5;margin-top:16px}
.pcard.pfill{background:var(--lime)}
.pcard.pfill .pname,.pcard.pfill .pbudget{color:var(--ink)}
.pcard.pfill .pscale{color:var(--ink);opacity:.65}
.pcard.pfill .pone{color:var(--ink);opacity:.82}
.pnote{font-family:var(--fm);font-size:11.5px;color:var(--mut);letter-spacing:.02em;margin-top:24px;line-height:1.6}
/* PACKAGES — detail (image-left, accent budget block) */
.case.pkg .budgetblock{display:inline-block;color:#fff;font-family:var(--fn);font-weight:700;font-size:28px;padding:7px 17px;border-radius:6px;margin:2px 0 18px}
.budgetblock.l{color:var(--ink)}
.pkgbody .summary{margin-bottom:4px}
.pkgincl{list-style:none;padding:0;margin:14px 0 0}
.pkgincl li{font-size:15px;color:var(--w);padding:7px 0 7px 22px;position:relative}
.pkgincl li:before{content:"";position:absolute;left:0;top:12px;width:9px;height:9px;border-radius:2px;background:var(--a,var(--lime))}
.pkgmeta{font-family:var(--fm);font-size:12px;color:var(--mut);letter-spacing:.06em;margin-top:20px}
.pkgproof{font-family:var(--fm);font-size:12px;margin-top:8px;letter-spacing:.04em}
/* PACKAGES — inverted finale ($100k+) */
.reveal .slides section.pkg-invert{padding:0;background:var(--lime)}
.pkg-invert .pi-left{position:absolute;left:64px;right:44%;top:50%;transform:translateY(-50%)}
.pkg-invert .pi-right{position:absolute;right:0;top:0;width:41%;height:100%;background-size:cover;background-position:center;background-color:#0c0c0c}
.pkg-invert .pkgh{color:var(--ink);font-size:40px;margin:4px 0 0;line-height:1.02}
.pkg-invert .ibudget{font-family:var(--fn);font-weight:700;font-size:56px;color:var(--ink);margin:8px 0 14px;letter-spacing:-.02em}
.pkg-invert .iwhat{font-size:18px;line-height:1.45;color:var(--ink);max-width:500px}
.pkg-invert .pkgincl.inv li{color:var(--ink)}.pkg-invert .pkgincl.inv li:before{background:var(--ink)}
.pkg-invert .pkgmeta.inv,.pkg-invert .pkgproof.inv{color:var(--ink);opacity:.78}
/* chrome */
.reveal .slides section.std:after{content:"PROOF · BY CHRIS & PARTNERS";position:absolute;left:64px;bottom:26px;font-family:var(--fm);font-size:11.5px;letter-spacing:.1em;color:var(--mut)}
.reveal .slides section.clients:after{display:none}
.reveal .progress{color:var(--lime);height:3px}
.reveal .controls{color:var(--lime)}
.reveal .slide-number{background:transparent;font-family:var(--fm);font-size:12px;color:var(--mut)}
@media(max-width:700px){.reveal .slides section{padding:30px 26px}.who .side{display:none}.who .hold{max-width:100%}.case-left{position:relative;width:100%;height:210px}.case-body{position:relative;left:0;right:0;top:0;transform:none;padding:24px 26px}.grid4,.strip,.contents,.pillars,.logos{grid-template-columns:1fr;height:auto}.stats{flex-wrap:wrap;gap:20px}}
</style>
</head>
<body>
<div class="reveal"><div class="slides">
${slidesHtml}
</div></div>
<script src="https://cdn.jsdelivr.net/npm/reveal.js@${REV}/dist/reveal.js"></script>
<script>
Reveal.initialize({width:1280,height:720,margin:0,minScale:.2,maxScale:1.8,controls:true,progress:true,hash:true,slideNumber:'c/t',transition:'fade',transitionSpeed:'fast',touch:true});
</script>
</body>
</html>`;
}
