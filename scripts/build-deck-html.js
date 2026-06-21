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

function caseSlide(c, i, total) {
  const acc = accVar[c.accent] || "var(--lime)";
  const img = c._hero ? `style="background-image:url('${c._hero}')"` : `class="noimg"`;
  return `<section class="case">
  <div class="case-img" ${img}></div>
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
  const { heroBy, heroes, owned, moreFinal } = await loadDeck(ROOT);
  const withHero = (c) => ({ ...c, _hero: heroBy[c.sanitySlug] || null });
  const H = heroes.map(withHero), OWN = owned.map(withHero), MORE = moreFinal.map(withHero);
  const shown = H.length + OWN.length + MORE.length;

  const slides = [];

  // COVER
  slides.push(`<section class="cover" style="background-image:url('/images/hero.jpeg')">
  <div class="cover-veil"></div>
  <div class="cover-in">
    <p class="brand">PROOF</p>
    ${kicker("WEB3 EVENT AGENCY  ·  BY CHRIS & PARTNERS  ·  SEOUL")}
    <h1>Global Stages.<br><em class="lime">Proven</em> Execution.</h1>
    <p class="cover-foot">Portfolio  ·  2026</p>
  </div>
</section>`);

  // WHO WE ARE
  slides.push(`<section class="std who" style="--side:url('/images/about.jpg')">
  <div class="side"></div>
  ${kicker("01 — WHO WE ARE")}
  <h2 class="big">A Web3 event agency,<br><span class="lime">built by Chris &amp; Partners.</span></h2>
  <p class="badge">★ OFFICIAL PARTNER · KOREA BLOCKCHAIN WEEK · SINCE 2023</p>
  <p class="lede">PROOF is the Web3 event agency of Chris &amp; Partners — a Seoul-based professional organizer with 15 years of international operations. Global projects hand us the brief; we deliver the event — side party, VIP reception, sponsor activation or full conference — from Seoul to Bangkok to Singapore. We know the venues, the vendors and the variables before you brief us.</p>
  <div class="whostats">
    ${[["150+", "Events organized"], ["15yr", "PCO track record"], ["Global", "Event operations"], ["Seoul", "Headquarters"]].map(([v, l]) => `<div><div class="sv lime">${v}</div><div class="sl">${l.toUpperCase()}</div></div>`).join("")}
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
  ${kicker("02 — WHAT WE DO")}
  <h2 class="big">What we do.</h2>
  <div class="grid4">
    ${cards.map(([im, t, d], i) => `<div class="card" style="background-image:url('/images/${im}')"><div class="card-veil"></div><span class="cn">0${i + 1}</span><div class="card-tx"><h3>${esc(t)}</h3><p>${esc(d)}</p></div></div>`).join("")}
  </div>
</section>`);

  // WHY PROOF
  const pillars = [
    ["Local ground ops", "Venues, vendors and crew secured in markets you don't operate in.", "var(--lime)"],
    ["Client-first", "Your brief, your brand — from a VIP dinner to a full conference.", "var(--mag)"],
    ["End to end", "Brief to on-site — run-of-show, AV, staffing, the variables.", "var(--blue)"],
  ];
  slides.push(`<section class="std">
  ${kicker("03 — WHY PROOF")}
  <h2 class="big">Global teams land for the one week <span class="lime">that matters</span> — with no ground game.</h2>
  <p class="lede wide">Seoul, Singapore, Bangkok — the rooms book out, the vendors are spoken for, and the calendar doesn't move. PROOF is the operator that's already there: 150+ events across the region, the venues and suppliers on speed-dial, and the failure points mapped before you brief us.</p>
  <div class="pillars">
    ${pillars.map(([t, d, c]) => `<div class="pillar"><span class="tick" style="background:${c}"></span><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join("")}
  </div>
</section>`);

  // SELECTED WORK — contents
  slides.push(`<section class="std">
  ${kicker("SELECTED WORK")}
  <h2 class="big">${shown} events. <span class="lime">Four in depth.</span></h2>
  <div class="contents">
    <div class="col">
      <p class="colhead">IN DEPTH</p>
      ${H.map((c, i) => `<div class="crow"><span class="cn2" style="color:${accVar[c.accent] || "var(--lime)"}">${String(i + 1).padStart(2, "0")}</span><div><div class="ct">${esc(c.title)}</div><div class="cs">${esc((SCOPE[c.scope] || "").toUpperCase())}</div></div></div>`).join("")}
    </div>
    <div class="col">
      <p class="colhead">ALSO INSIDE</p>
      <h3 class="alsoh">Owned flagship</h3>
      <p class="alsop mag">Seoul Meta Week — ${OWN.length} editions, 2021–2025</p>
      <h3 class="alsoh">More client work</h3>
      <p class="alsop">${MORE.map((c) => esc(c.title)).join("   ·   ")}</p>
    </div>
  </div>
</section>`);

  // HERO CASES
  H.forEach((c, i) => slides.push(caseSlide(c, i, H.length)));

  // OWNED FLAGSHIP strip
  slides.push(`<section class="std">
  ${kicker("OUR OWN FLAGSHIP", "var(--mag)")}
  <h2 class="big">We don't only run clients' events — <span class="mag">we built our own.</span></h2>
  <p class="lede wide">Seoul Meta Week — ${OWN.length} editions, 2021–2025. Proof we can produce and scale a 1,500-person summit end to end, not just a side event.</p>
  <div class="strip">
    ${OWN.map((c) => { const k = (c.kpis || [])[0] || {}; return `<div class="scard"><div class="simg" ${c._hero ? `style="background-image:url('${c._hero}')"` : `class="noimg"`}></div><div class="syr mag">${esc(year(c))}</div><div class="sv">${esc(k.value || "")}</div><div class="sl">${esc(String(k.label || "").toUpperCase())}</div></div>`; }).join("")}
  </div>
</section>`);

  // MORE CLIENT WORK grid
  slides.push(`<section class="std">
  ${kicker("MORE CLIENT WORK", "var(--blue)")}
  <h2 class="big">A deeper <span class="lime">bench.</span></h2>
  <p class="lede wide">Selected from 150+ events — activations, mixers, hackathons and roadshows across the region.</p>
  <div class="strip">
    ${MORE.slice(0, 5).map((c) => { const acc = accVar[c.accent] || "var(--lime)"; const k = (c.kpis || [])[0] || {}; return `<div class="scard"><div class="simg" ${c._hero ? `style="background-image:url('${c._hero}')"` : `class="noimg"`}></div><div class="mt">${esc(c.title)}</div><div class="ms" style="color:${acc}">${esc((SCOPE[c.scope] || "").toUpperCase())}</div><div class="mk">${esc(k.value || "")} · ${esc(k.label || "")}</div></div>`; }).join("")}
  </div>
</section>`);

  // CLIENTS & PARTNERS
  const logos = ["Polygon", "Sahara AI", "BitGo", "Gensyn", "Hashed", "TV Chosun", "Hashkey", "TokenPost", "WEMIX", "AEON Protocol", "Solana", "Glosfer"];
  const ev = ["TOKEN2049", "Seoul Meta Week", "Aggregation Summit", "Polygon Connect", "Consensus Asia", "EthDenver", "DevCon"];
  slides.push(`<section class="std">
  ${kicker("CLIENTS & PARTNERS")}
  <div class="logos">${logos.map((l) => `<div class="logo">${esc(l.toUpperCase())}</div>`).join("")}</div>
  ${kicker("OFFICIAL PARTNER")}
  <p class="kbw"><span class="lime">Korea Blockchain Week</span> — official partner since 2023.</p>
  ${kicker("ALSO OPERATING AT", "var(--mag)")}
  <p class="opat">${ev.map((e, i) => `<span class="${i % 2 ? "w" : "mag"}">${esc(e)}</span>`).join(`<i>✳</i>`)}</p>
</section>`);

  // CONTACT
  slides.push(`<section class="cover contact" style="background-image:url('/images/cta.jpg')">
  <div class="cover-veil"></div>
  <div class="cover-in">
    ${kicker("LET'S TALK")}
    <h1>Take your project to the <span class="lime">world stage.</span></h1>
    <p class="contactlines"><b>hello@chrisandpartners.co</b><br>+82-2-375-4620<br><span class="lime">proof.chrisandpartners.co</span></p>
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
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400;1,9..144,600&family=IBM+Plex+Mono:wght@400;500&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@${REV}/dist/reveal.css">
<style>
:root{--bg:#151515;--bg2:#1F1F1F;--w:#F4F1EC;--mut:#9A9A9A;--line:#3A3A3A;--lime:#D6FF3F;--mag:#FF3D9A;--blue:#5B8CFF;--fn:'Fraunces',Georgia,serif;--fm:'IBM Plex Mono',monospace;--fb:'Manrope',system-ui,sans-serif}
html,body{background:var(--bg)}
.reveal{font-family:var(--fb);color:var(--w);font-weight:400}
.reveal .slides{text-align:left}
.reveal .slides section{padding:54px 60px;box-sizing:border-box;height:100%;inset:0}
.reveal h1,.reveal h2,.reveal h3{font-family:var(--fn);font-weight:600;color:var(--w);text-transform:none;margin:0;letter-spacing:-.01em;line-height:1.0}
.reveal p{margin:0}
.lime{color:var(--lime)}.mag{color:var(--mag)}.blue{color:var(--blue)}
.kicker{font-family:var(--fm);font-size:15px;letter-spacing:.18em;text-transform:uppercase;margin:0 0 18px}
.sv{font-family:var(--fn);font-weight:600}.sl{font-family:var(--fm);font-size:12px;color:var(--mut);letter-spacing:.08em;margin-top:4px}
/* COVER */
.cover{background-size:cover;background-position:center}
.cover .cover-veil{position:absolute;inset:0;background:linear-gradient(90deg,rgba(10,10,10,.78),rgba(10,10,10,.45))}
.cover-in{position:relative}
.cover .brand{font-family:var(--fn);font-weight:600;font-size:30px;letter-spacing:.08em}
.cover h1{font-family:var(--fn);font-style:italic;font-weight:600;font-size:78px;line-height:.98;margin-top:170px}
.cover .cover-foot{font-family:var(--fm);font-size:15px;color:var(--mut);position:absolute;bottom:-150px}
.cover .kicker{margin-top:150px;margin-bottom:10px}
.contact h1{font-size:62px;font-style:normal;margin-top:18px}
.contact .kicker{margin-top:0}
.contactlines{font-family:var(--fm);font-size:21px;line-height:2;margin-top:40px}
.contact .cover-foot{font-family:var(--fm);font-size:13px;color:#CFCBC4;bottom:46px}
/* STD slides */
.std .big{font-size:46px;margin-bottom:24px;max-width:1050px}
.lede{font-size:21px;line-height:1.45;color:var(--w);max-width:760px}.lede.wide{max-width:1040px;color:var(--mut)}
.who .side{position:absolute;right:0;top:0;width:34%;height:100%;background-image:var(--side);background-size:cover;background-position:center}
.who .side:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,var(--bg),rgba(21,21,21,.25))}
.who .big{font-size:40px;max-width:62%}
.badge{display:inline-block;font-family:var(--fm);font-size:13px;letter-spacing:.12em;color:var(--lime);border:1px solid var(--lime);border-radius:7px;padding:9px 16px;margin:6px 0 22px}
.who .lede{max-width:60%;font-size:18px}
.whostats{display:flex;gap:48px;margin-top:34px}
.whostats .sv{font-size:42px}
/* WHAT grid */
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:30px;height:62%}
.card{position:relative;border-radius:4px;overflow:hidden;background-size:cover;background-position:center;display:flex;align-items:flex-end}
.card-veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,14,14,.25),rgba(14,14,14,.86))}
.card .cn{position:absolute;top:16px;left:18px;font-family:var(--fm);color:var(--lime);font-size:15px;z-index:2}
.card-tx{position:relative;padding:20px;z-index:2}.card-tx h3{font-size:23px;margin-bottom:8px}.card-tx p{font-size:14px;color:#D9D5CE;line-height:1.35}
/* WHY pillars */
.pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;margin-top:54px;max-width:1080px}
.pillar .tick{display:block;width:34px;height:4px;border-radius:2px;margin-bottom:18px}
.pillar h3{font-size:27px;margin-bottom:12px}.pillar p{font-size:16px;color:var(--mut);line-height:1.45}
/* CONTENTS */
.contents{display:grid;grid-template-columns:1fr 1fr;gap:50px;margin-top:30px}
.colhead{font-family:var(--fm);font-size:13px;letter-spacing:.16em;color:var(--mut);margin-bottom:22px}
.crow{display:flex;gap:18px;align-items:flex-start;padding:14px 0;border-bottom:1px solid var(--line)}
.cn2{font-family:var(--fm);font-size:19px}.ct{font-family:var(--fn);font-size:24px}.cs{font-family:var(--fm);font-size:12px;color:var(--mut);letter-spacing:.08em;margin-top:4px}
.alsoh{font-size:24px;margin-top:6px}.alsop{font-family:var(--fm);font-size:15px;color:var(--mut);line-height:1.7;margin:8px 0 26px}.alsop.mag{color:var(--mag)}
/* CASE */
.reveal .slides section.case{padding:0}
.case-img{position:absolute;left:0;top:0;width:52%;height:100%;background-size:cover;background-position:center}
.case-img:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(14,14,14,.35),rgba(21,21,21,.65) 88%,var(--bg))}
.case-img.noimg{background:var(--bg2)}
.case-tag{position:absolute;left:34px;bottom:30px;font-family:var(--fm);font-size:15px;color:var(--mut);z-index:3}.case-tag b{color:var(--w);font-weight:400}
.case-body{position:absolute;left:55%;right:4.5%;top:13%}
.case-body h2{font-size:40px;margin:0 0 14px}
.meta{font-family:var(--fm);font-size:13px;color:var(--mut);letter-spacing:.06em;margin-bottom:18px}
.summary{font-size:18px;line-height:1.45;color:var(--w);max-width:560px}
.stats{display:flex;gap:34px;margin:30px 0 4px}
.stats .sv{font-size:30px}
.scopelabel{font-family:var(--fm);font-size:12px;letter-spacing:.18em;margin:20px 0 6px}
.scopeitems{font-family:var(--fm);font-size:13px;color:var(--mut)}
.quote{font-family:var(--fn);font-style:italic;font-size:17px;color:#E6E2DB;margin-top:20px;max-width:560px;line-height:1.35}
/* STRIP (owned + more) */
.strip{display:grid;grid-template-columns:repeat(5,1fr);gap:18px;margin-top:34px}
.simg{height:150px;border-radius:4px;background-size:cover;background-position:center;background-color:var(--bg2)}.simg.noimg{background:var(--bg2)}
.syr{font-family:var(--fn);font-size:30px;margin-top:14px}.scard .sv{font-size:20px;margin-top:4px}
.mt{font-family:var(--fn);font-size:18px;margin-top:14px;line-height:1.1}.ms{font-family:var(--fm);font-size:11px;letter-spacing:.08em;margin-top:8px}.mk{font-family:var(--fm);font-size:12px;color:var(--mut);margin-top:5px}
/* CLIENTS */
.logos{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:10px 0 40px}
.logo{border:1px solid var(--line);background:var(--bg2);border-radius:4px;text-align:center;padding:20px 0;font-family:var(--fm);font-size:15px;letter-spacing:.08em}
.kbw{font-family:var(--fn);font-style:italic;font-size:33px;margin:6px 0 30px}
.opat{font-family:var(--fn);font-style:italic;font-size:25px;line-height:1.4}.opat i{color:var(--mag);font-style:normal;margin:0 14px;font-size:18px}.opat .w{color:var(--w)}.opat .mag{color:var(--mag)}
/* footer brand */
.reveal .slides section.std:after,.reveal .slides section.case:after{content:"PROOF · BY CHRIS & PARTNERS";position:absolute;left:60px;bottom:24px;font-family:var(--fm);font-size:12px;letter-spacing:.1em;color:var(--mut)}
.reveal .slides section.case:after{left:34px;display:none}
.reveal .progress{color:var(--lime)}
.reveal .controls{color:var(--lime)}
@media(max-width:700px){.reveal .slides section{padding:30px 26px}.who .side{display:none}.who .big,.who .lede{max-width:100%}.case-img{position:relative;width:100%;height:200px}.case-body{position:relative;left:0;right:0;top:0;padding:24px 26px}.grid4,.strip,.contents,.pillars,.logos{grid-template-columns:1fr;height:auto}.stats{flex-wrap:wrap;gap:20px}}
</style>
</head>
<body>
<div class="reveal"><div class="slides">
${slidesHtml}
</div></div>
<script src="https://cdn.jsdelivr.net/npm/reveal.js@${REV}/dist/reveal.js"></script>
<script>
Reveal.initialize({width:1280,height:720,margin:0.04,minScale:.2,maxScale:1.6,controls:true,progress:true,hash:true,slideNumber:'c/t',transition:'fade',transitionSpeed:'fast',touch:true});
</script>
</body>
</html>`;
}
