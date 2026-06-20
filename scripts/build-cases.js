#!/usr/bin/env node
/* Hybrid single source -> web.
   - Assets (hero image + gallery) come from the SHARED Sanity CMS (public-read,
     projectId x6yzy771) the C&P site uses — matched by sanitySlug.
   - English copy (title, scope, summary, specs, KPIs, narrative, quote) lives in
     cases/proof-cases.json — PROOF owns the English voice (the Sanity body is
     Korean), which also avoids duplicate content with the C&P site.
   Generates work/<slug>.html + work/index.html + sitemap.xml.
   The deck (scripts/build-deck.js) reads the same proof-cases.json + Sanity. */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SITE = "https://proof.chrisandpartners.co";
const PID = "x6yzy771", DS = "production";
const QUERY = `*[_type=="plate" && proof==true]{title,"slug":slug.current,proofScope,year,image,gallery}`;
// Manually pin cases to the front of /work/ (by Sanity slug, in order). Everything else sorts newest-year-first.
const PIN = [];

const ACCENT = { c1: "#D6FF3F", c2: "#FF3D9A", c3: "#5B8CFF" };
const SCOPE = { "side-event": "Side Event", "owned-summit": "Owned Summit", "korea-entry": "Korea Market Entry", "booth": "Booth & Exhibition", "investor-dinner": "Investor Dinner", "activation": "Activation", "conference-production": "Conference Production", "full-production": "Full Production" };
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const attr = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
function imgUrl(ref, w) {
  if (!ref) return "";
  const m = ref.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/);
  if (!m) return "";
  return `https://cdn.sanity.io/images/${PID}/${DS}/${m[1]}-${m[2]}.${m[3]}` + (w ? `?w=${w}&auto=format&fit=max` : "");
}

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..700&family=IBM+Plex+Mono:wght@400;500&family=Manrope:wght@300;400;500;600&display=swap" rel="stylesheet">`;
const GTM_HEAD = `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-WQP2RKFR');</script>`;
const GTM_BODY = `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WQP2RKFR" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;
const FAVICON = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='5' fill='%23181818'/%3E%3Cpath fill='%23D6FF3F' d='M8 22V10h3.2l4.8 7.6V10H19v12h-3.1l-4.9-7.8V22H8z'/%3E%3C/svg%3E">`;
const NAV = `<nav class="nav" aria-label="PROOF"><a href="/" class="logo">PROOF</a><div class="nav-r"><a href="/#expertise" class="nav-link-hide">Expertise</a><a href="/work/" class="is-current">Work</a><a href="/blog/" class="nav-link-hide">Insights</a><a href="/#contact" class="nav-cta">Start a Project</a></div></nav>`;
const FOOTER = `<footer class="ft"><div><span class="ft-logo">PROOF</span><span class="ft-sub">Web3 Event Agency · by Chris &amp; Partners · Seoul</span></div><div class="ft-links"><a href="/#expertise">Expertise</a><a href="/work/">Work</a><a href="/blog/">Insights</a><a href="/#contact">Contact</a><a href="https://chrisandpartners.co" target="_blank" rel="noopener noreferrer">C&amp;P ↗</a></div></footer>`;

const tagFor = (c) => SCOPE[c.scope] || "Web3 Event";
const metaLine = (c) => [c.host, c.location].filter(Boolean).join("  ·  ");

function casePage(c) {
  const url = `${SITE}/work/${c.slug}.html`;
  const acc = ACCENT[c.accent] || ACCENT.c1;
  const tag = tagFor(c);
  const specMeta = [["Client", c.host], ["When", c.year], ["Where", c.location], ["Scope", tag]]
    .filter(([, v]) => v).map(([k, v]) => `<div class="spec"><span class="spec-l">${esc(k)}</span><span class="spec-v sm">${esc(v)}</span></div>`).join("");
  const kpis = (c.kpis || []).map((m) => `<div class="spec"><span class="spec-v">${esc(m.value)}</span><span class="spec-l">${esc(m.label)}</span></div>`).join("");
  const body = (c.sections || []).length ? c.sections.map((s) => `<h2>${esc(s.h)}</h2>\n      <p>${esc(s.p)}</p>`).join("\n      ") : `<p>${esc(c.summary)}</p>`;
  const scope = (c.scopeItems || []).length ? `<div class="case-scope"><span class="cs-label">What we handled</span><ul>${c.scopeItems.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>` : "";
  const quote = c.quote ? `<blockquote class="case-quote">“${esc(c.quote.text)}”<cite>— ${esc(c.quote.attrib)}</cite></blockquote>` : "";
  const gallery = (c._gallery || []).length ? `<section class="case-gallery">${c._gallery.map((u) => `<figure><img src="${u}" alt="${attr(c.title)}" loading="lazy" decoding="async"></figure>`).join("")}</section>` : "";
  const ld = { "@context": "https://schema.org", "@type": "CreativeWork", name: c.title, genre: tag, description: c.summary, image: c._hero, url, creator: { "@type": "Organization", name: "PROOF", url: SITE + "/" }, inLanguage: "en" };
  const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "PROOF", item: SITE + "/" }, { "@type": "ListItem", position: 2, name: "Work", item: SITE + "/work/" }, { "@type": "ListItem", position: 3, name: c.title, item: url }] };
  return `<!DOCTYPE html>
<html lang="en">
<head>
${GTM_HEAD}
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(c.title)} — ${esc(tag)} | PROOF Case Study</title>
<meta name="description" content="${attr(c.summary)}">
<meta name="author" content="PROOF — by Chris & Partners">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<meta name="color-scheme" content="dark">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="en" href="${url}"><link rel="alternate" hreflang="x-default" href="${url}">
<meta property="og:type" content="article"><meta property="og:title" content="${attr(c.title)} — ${attr(tag)} | PROOF">
<meta property="og:description" content="${attr(c.summary)}"><meta property="og:image" content="${c._hero}"><meta property="og:url" content="${url}">
<meta property="og:site_name" content="PROOF — Web3 Event Agency">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${attr(c.title)} — PROOF Case Study"><meta name="twitter:image" content="${c._hero}">
${FAVICON}${FONTS}
<link rel="stylesheet" href="/blog/blog.css"><link rel="stylesheet" href="/work/work.css">
<meta name="theme-color" content="#181818">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<script type="application/ld+json">${JSON.stringify(crumbs)}</script>
</head>
<body id="top" style="--acc:${acc}">
${GTM_BODY}${NAV}
<main>
<article>
  <div class="wrap">
    <nav class="crumb"><a href="/">PROOF</a><span>/</span><a href="/work/">Work</a><span>/</span>${esc(c.title)}</nav>
    <p class="case-kicker">${esc(tag)}</p>
    <h1 class="case-title">${esc(c.title)}</h1>
    ${metaLine(c) ? `<p class="case-meta">${esc(metaLine(c))}</p>` : ""}
  </div>
  ${c._hero ? `<div class="case-hero"><img src="${c._hero}" alt="${attr(c.title)}" loading="eager" decoding="async"></div>` : ""}
  <div class="wrap">
    <div class="case-specs">${specMeta}${kpis}</div>
    <div class="case-body prose">
      ${body}
      ${scope}
    </div>
    ${quote}
  </div>
  ${gallery}
  <div class="wrap">
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

function indexPage(cases) {
  const cards = cases.map((c) => `    <a href="/work/${c.slug}.html" class="wx-card" style="--acc:${ACCENT[c.accent] || ACCENT.c1}">
      <div class="wx-img"><img src="${c._heroThumb}" alt="${attr(c.title)}" loading="lazy" decoding="async"></div>
      <div class="wx-body"><span class="wx-tag">${esc(tagFor(c))}</span><h2 class="wx-title">${esc(c.title)}</h2><span class="wx-meta">${esc(metaLine(c))}</span></div>
    </a>`).join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
${GTM_HEAD}
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Work — Web3 Event Case Studies | PROOF</title>
<meta name="description" content="Web3 event case studies by PROOF — owned summits (Seoul Meta Week), TOKEN2049 & KBW side events, conference production for Polygon, activations and Korea market entry.">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<meta name="color-scheme" content="dark">
<link rel="canonical" href="${SITE}/work/">
<link rel="alternate" hreflang="en" href="${SITE}/work/"><link rel="alternate" hreflang="x-default" href="${SITE}/work/">
<meta property="og:type" content="website"><meta property="og:title" content="Work — Web3 Event Case Studies | PROOF">
<meta property="og:description" content="Web3 event case studies — owned summits, TOKEN2049 & KBW side events, conference production, activations and Korea market entry.">
<meta property="og:image" content="${SITE}/images/og-image.jpg"><meta property="og:url" content="${SITE}/work/">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${SITE}/images/og-image.jpg">
${FAVICON}${FONTS}
<link rel="stylesheet" href="/blog/blog.css"><link rel="stylesheet" href="/work/work.css">
<meta name="theme-color" content="#181818">
</head>
<body id="top">
${GTM_BODY}${NAV}
<main>
<div class="wrap">
  <header class="idx-head">
    <p class="case-kicker">Selected Work</p>
    <h1>Rooms we've built.</h1>
    <p class="idx-sub">Owned summits, conference production, side events and activations for global Web3 projects — produced end to end. ${cases.length} selected case studies.</p>
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

function sitemap(cases) {
  const today = "2026-06-16";
  const urls = [
    { loc: "/", lm: today, cf: "weekly", pr: "1.0" },
    { loc: "/work/", lm: today, cf: "weekly", pr: "0.9" },
    { loc: "/blog/", lm: "2026-06-15", cf: "weekly", pr: "0.7" },
    { loc: "/blog/korea-web3-market-entry.html", lm: "2026-06-14", cf: "monthly", pr: "0.8" },
    { loc: "/blog/kbw-side-event-guide.html", lm: "2026-06-15", cf: "monthly", pr: "0.8" },
    { loc: "/blog/token2049-side-event-checklist.html", lm: "2026-06-15", cf: "monthly", pr: "0.8" },
    ...cases.map((c) => ({ loc: `/work/${c.slug}.html`, lm: today, cf: "monthly", pr: "0.7" })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url>\n    <loc>${SITE}${u.loc}</loc>\n    <lastmod>${u.lm}</lastmod>\n    <changefreq>${u.cf}</changefreq>\n    <priority>${u.pr}</priority>\n  </url>`).join("\n")}\n</urlset>\n`;
}

const yearNum = (y) => { const m = String(y == null ? "" : y).match(/\d{4}/g); return m ? Math.max(...m.map(Number)) : 0; };

(async () => {
  const res = await fetch(`https://${PID}.apicdn.sanity.io/v2021-10-21/data/query/${DS}?query=${encodeURIComponent(QUERY)}`);
  if (!res.ok) throw new Error(`Sanity fetch failed: HTTP ${res.status} — aborting build (last good deploy is kept).`);
  const plates = (await res.json()).result;
  if (!plates.length) throw new Error("Sanity returned 0 plates — aborting build to avoid publishing an empty portfolio.");
  // PROOF English-copy overrides (optional, by sanitySlug). Sanity is the source for WHICH items exist + scope + photos.
  const overrides = {};
  for (const o of JSON.parse(fs.readFileSync(path.join(ROOT, "cases/proof-cases.json"), "utf8"))) overrides[o.sanitySlug] = o;

  const noCopy = [];
  const cases = plates.map((p, i) => {
    const ov = overrides[p.slug] || {};
    const ref = p.image && p.image.asset && p.image.asset._ref;
    const scope = p.proofScope || ov.scope || null;        // Sanity is authoritative for scope
    if (!ov.sections) noCopy.push((ov.title || p.title) + (p.proofScope ? "" : " [no scope]"));
    return {
      sanitySlug: p.slug,
      slug: ov.slug || p.slug,
      title: ov.title || p.title,
      scope,
      accent: ov.accent || ["c1", "c2", "c3"][i % 3],
      host: ov.host || "",
      location: ov.location || "",
      year: p.year || "",
      summary: ov.summary || `${ov.title || p.title} — ${SCOPE[scope] || "a Web3 event"} produced by PROOF, the Web3 division of Chris & Partners.`,
      kpis: ov.kpis || [],
      sections: ov.sections || [],
      scopeItems: ov.scopeItems || [],
      quote: ov.quote || null,
      _year: yearNum(p.year),
      _ovOrder: ov.order == null ? 999 : ov.order,
      _hero: imgUrl(ref, 1800),
      _heroSmall: imgUrl(ref, 640),
      _heroThumb: imgUrl(ref, 1000) || SITE + "/images/og-image.jpg",
      _gallery: (p.gallery || []).map((g) => imgUrl(g.asset && g.asset._ref, 1200)).filter(Boolean),
    };
  });
  // Order: pinned (PIN list) first, then newest year first, tie-break by curated order, then title.
  const pinIdx = (c) => { const k = PIN.indexOf(c.sanitySlug); return k === -1 ? 1e9 : k; };
  cases.sort((a, b) => pinIdx(a) - pinIdx(b) || b._year - a._year || a._ovOrder - b._ovOrder || a.title.localeCompare(b.title));

  for (const c of cases) fs.writeFileSync(path.join(ROOT, "work", `${c.slug}.html`), casePage(c));
  fs.writeFileSync(path.join(ROOT, "work", "index.html"), indexPage(cases));
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap(cases));
  // hero-images.js — marquee hero photos, auto-synced from Sanity (one hero per case, cap 14)
  const heroImgs = cases.map((c) => c._heroSmall).filter(Boolean).slice(0, 14);
  fs.writeFileSync(path.join(ROOT, "hero-images.js"), "window.PROOF_HERO_IMAGES=" + JSON.stringify(heroImgs) + ";\n");
  fs.writeFileSync(path.join(ROOT, "build-info.json"), JSON.stringify({ builtAt: new Date().toISOString(), cases: cases.length, heroImages: heroImgs.length, sanityPlates: plates.length, source: `sanity:${PID}/${DS}` }, null, 2) + "\n");
  console.log(`Generated ${cases.length} case pages + index + sitemap + build-info (from ${plates.length} Sanity plates).`);
  if (noCopy.length) console.log(`NOTE ${noCopy.length} item(s) have no PROOF English copy yet (render from Sanity title/scope/photos):\n - ` + noCopy.join("\n - "));
})();
