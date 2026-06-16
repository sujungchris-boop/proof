#!/usr/bin/env node
/* Single source -> web. Reads cases/cases.json and generates:
   - work/<slug>.html  (case study pages)
   - work/index.html   (Selected Work index)
   - sitemap.xml       (home + blog + work)
   The deck generator (scripts/build-deck.js) reads the SAME cases.json. */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SITE = "https://proof.chrisandpartners.co";
const cases = JSON.parse(fs.readFileSync(path.join(ROOT, "cases/cases.json"), "utf8"))
  .sort((a, b) => (a.order || 99) - (b.order || 99));

const ACCENT = { c1: "#D6FF3F", c2: "#FF3D9A", c3: "#5B8CFF" };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const attr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..700&family=IBM+Plex+Mono:wght@400;500&family=Manrope:wght@300;400;500;600&display=swap" rel="stylesheet">`;
const GTM_HEAD = `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WQP2RKFR');</script>`;
const GTM_BODY = `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WQP2RKFR" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;
const FAVICON = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='5' fill='%23181818'/%3E%3Cpath fill='%23D6FF3F' d='M8 22V10h3.2l4.8 7.6V10H19v12h-3.1l-4.9-7.8V22H8z'/%3E%3C/svg%3E">`;

const NAV = `<nav class="nav" aria-label="PROOF">
  <a href="/" class="logo" aria-label="PROOF — home">PROOF</a>
  <div class="nav-r">
    <a href="/#expertise" class="nav-link-hide">Expertise</a>
    <a href="/work/" class="is-current">Work</a>
    <a href="/blog/" class="nav-link-hide">Insights</a>
    <a href="/#contact" class="nav-cta">Start a Project</a>
  </div>
</nav>`;
const FOOTER = `<footer class="ft" role="contentinfo">
  <div>
    <span class="ft-logo">PROOF</span>
    <span class="ft-sub">Web3 Event Agency · by Chris &amp; Partners · Seoul</span>
  </div>
  <div class="ft-links">
    <a href="/#expertise">Expertise</a>
    <a href="/work/">Work</a>
    <a href="/blog/">Insights</a>
    <a href="/#contact">Contact</a>
    <a href="https://chrisandpartners.co" target="_blank" rel="noopener noreferrer">C&amp;P ↗</a>
  </div>
</footer>`;

function metaLine(c) {
  return [c.client, c.date, c.city && c.venue ? `${c.venue}, ${c.city}` : (c.venue || c.city)]
    .filter((x) => x && x !== "—").join("  ·  ");
}

function casePage(c) {
  const url = `${SITE}/work/${c.slug}.html`;
  const acc = ACCENT[c.accent] || ACCENT.c1;
  const ogImg = SITE + c.hero;
  const ld = {
    "@context": "https://schema.org", "@type": "CreativeWork",
    name: c.title, about: "Web3 event production", genre: c.tag,
    description: c.summary, image: ogImg, url,
    creator: { "@type": "Organization", name: "PROOF", url: SITE + "/" },
    inLanguage: "en"
  };
  const crumbs = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "PROOF", item: SITE + "/" },
      { "@type": "ListItem", position: 2, name: "Work", item: SITE + "/work/" },
      { "@type": "ListItem", position: 3, name: c.title, item: url }
    ]
  };
  const metrics = (c.metrics || []).map((m) =>
    `<div class="spec"><span class="spec-v">${esc(m.value)}</span><span class="spec-l">${esc(m.label)}</span></div>`).join("\n        ");
  const specsMeta = [["Client", c.client], ["When", c.date], ["Where", [c.venue, c.city].filter(x=>x&&x!=="—").join(", ")], ["Scope", c.tag]]
    .filter(([, v]) => v && v !== "—")
    .map(([k, v]) => `<div class="spec"><span class="spec-l">${esc(k)}</span><span class="spec-v sm">${esc(v)}</span></div>`).join("\n        ");
  const body = (c.sections || []).map((s) =>
    `<h2>${esc(s.h)}</h2>\n      <p>${esc(s.p)}</p>`).join("\n      ");
  const scope = (c.scope || []).length
    ? `<div class="case-scope"><span class="cs-label">What we handled</span><ul>${c.scope.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>` : "";
  const quote = c.quote
    ? `<blockquote class="case-quote">“${esc(c.quote.text)}”<cite>— ${esc(c.quote.attrib)}</cite></blockquote>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
${GTM_HEAD}
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(c.title)} — ${esc(c.tag)} | PROOF Case Study</title>
<meta name="description" content="${attr(c.summary)}">
<meta name="author" content="PROOF — by Chris & Partners">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<meta name="color-scheme" content="dark">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="${url}">
<link rel="alternate" hreflang="x-default" href="${url}">
<meta property="og:type" content="article">
<meta property="og:title" content="${attr(c.title)} — ${attr(c.tag)} | PROOF">
<meta property="og:description" content="${attr(c.summary)}">
<meta property="og:image" content="${ogImg}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="PROOF — Web3 Event Agency">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${attr(c.title)} — PROOF Case Study">
<meta name="twitter:description" content="${attr(c.summary)}">
<meta name="twitter:image" content="${ogImg}">
${FAVICON}
${FONTS}
<link rel="stylesheet" href="/blog/blog.css">
<link rel="stylesheet" href="/work/work.css">
<meta name="theme-color" content="#181818">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<script type="application/ld+json">${JSON.stringify(crumbs)}</script>
</head>
<body id="top" style="--acc:${acc}">
${GTM_BODY}
${NAV}
<main>
<article>
  <div class="wrap">
    <nav class="crumb" aria-label="Breadcrumb"><a href="/">PROOF</a><span>/</span><a href="/work/">Work</a><span>/</span>${esc(c.title)}</nav>
    <p class="case-kicker">${esc(c.tag)}</p>
    <h1 class="case-title">${esc(c.title)}</h1>
    <p class="case-meta">${esc(metaLine(c))}</p>
  </div>
  <div class="case-hero"><img src="${attr(c.hero)}" alt="${attr(c.title + " — " + (c.context || c.tag))}" loading="eager" decoding="async"></div>
  <div class="wrap">
    <div class="case-specs">
        ${specsMeta}
        ${metrics}
    </div>
    <div class="case-body prose">
      ${body}
      ${scope}
    </div>
    ${quote}
    <aside class="post-cta">
      <span class="pc-k">PROOF — by Chris &amp; Partners · Seoul</span>
      <h2>Planning something like this?</h2>
      <p>We hold the venues, the vendors and the local context for global Web3 events. Bring us the goal.</p>
      <a href="/#contact" class="btn-w">Start a Project</a>
    </aside>
  </div>
</article>
</main>
${FOOTER}
</body>
</html>
`;
}

function indexPage() {
  const cards = cases.map((c) => `    <a href="/work/${c.slug}.html" class="wx-card" style="--acc:${ACCENT[c.accent] || ACCENT.c1}">
      <div class="wx-img"><img src="${attr(c.hero)}" alt="${attr(c.title)}" loading="lazy" decoding="async"></div>
      <div class="wx-body">
        <span class="wx-tag">${esc(c.tag)}</span>
        <h2 class="wx-title">${esc(c.title)}</h2>
        <span class="wx-meta">${esc(metaLine(c))}</span>
      </div>
    </a>`).join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
${GTM_HEAD}
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Work — Web3 Event Case Studies | PROOF</title>
<meta name="description" content="Selected Web3 event case studies by PROOF — side events, owned summits and activations for global blockchain projects. TOKEN2049, KBW, Seoul Meta Week and more.">
<meta name="author" content="PROOF — by Chris & Partners">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<meta name="color-scheme" content="dark">
<link rel="canonical" href="${SITE}/work/">
<link rel="alternate" hreflang="en" href="${SITE}/work/">
<link rel="alternate" hreflang="x-default" href="${SITE}/work/">
<meta property="og:type" content="website">
<meta property="og:title" content="Work — Web3 Event Case Studies | PROOF">
<meta property="og:description" content="Selected Web3 event case studies — side events, owned summits and activations for global blockchain projects.">
<meta property="og:image" content="${SITE}/images/og-image.jpg">
<meta property="og:url" content="${SITE}/work/">
<meta property="og:site_name" content="PROOF — Web3 Event Agency">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE}/images/og-image.jpg">
${FAVICON}
${FONTS}
<link rel="stylesheet" href="/blog/blog.css">
<link rel="stylesheet" href="/work/work.css">
<meta name="theme-color" content="#181818">
</head>
<body id="top">
${GTM_BODY}
${NAV}
<main>
<div class="wrap">
  <header class="idx-head">
    <p class="case-kicker">Selected Work</p>
    <h1>Rooms we've built.</h1>
    <p class="idx-sub">Side events, owned summits and activations for global Web3 projects — produced end to end. Full case studies; more available on request.</p>
  </header>
</div>
<div class="wx-grid">
${cards}
</div>
</main>
${FOOTER}
</body>
</html>
`;
}

function sitemap() {
  const today = "2026-06-16";
  const urls = [
    { loc: "/", lm: today, cf: "weekly", pr: "1.0" },
    { loc: "/work/", lm: today, cf: "monthly", pr: "0.8" },
    { loc: "/blog/", lm: "2026-06-15", cf: "weekly", pr: "0.7" },
    { loc: "/blog/korea-web3-market-entry.html", lm: "2026-06-14", cf: "monthly", pr: "0.8" },
    { loc: "/blog/kbw-side-event-guide.html", lm: "2026-06-15", cf: "monthly", pr: "0.8" },
    { loc: "/blog/token2049-side-event-checklist.html", lm: "2026-06-15", cf: "monthly", pr: "0.8" },
    ...cases.map((c) => ({ loc: `/work/${c.slug}.html`, lm: today, cf: "monthly", pr: "0.7" }))
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${SITE}${u.loc}</loc>
    <lastmod>${u.lm}</lastmod>
    <changefreq>${u.cf}</changefreq>
    <priority>${u.pr}</priority>
  </url>`).join("\n")}
</urlset>
`;
}

// ── write ──
let n = 0;
for (const c of cases) {
  fs.writeFileSync(path.join(ROOT, "work", `${c.slug}.html`), casePage(c));
  n++;
}
fs.writeFileSync(path.join(ROOT, "work", "index.html"), indexPage());
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap());
console.log(`Generated ${n} case pages + work/index.html + sitemap.xml`);
