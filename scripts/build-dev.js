#!/usr/bin/env node
/**
 * Mirror /blog/*.html and /work/*.html into /dev/blog and /dev/work using the
 * redesigned stylesheet (/dev/site.css), so the whole redesign can be reviewed
 * at a public URL before it replaces the live pages.
 *
 * - swaps fonts + stylesheets for /dev/site.css
 * - replaces nav + footer with the redesign's
 * - rewrites internal page links to stay inside /dev/
 * - strips GTM (no dev traffic in GA4/Ads) and adds noindex
 * - drops case-page testimonial quotes (pending owner verification)
 *
 * Runs after build-cases.js on every Vercel build. Output is gitignored.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SECTIONS = ["blog", "work"];

const NAV = (cur) => `<div class="dev-flag">Dev preview of the redesigned site. Not indexed. <a href="/">Live site</a></div>
<header class="nav"><div class="nav-in"><a href="/dev/" class="logo">PROOF <small>by Chris &amp; Partners</small></a><nav class="nav-links" aria-label="Main"><a href="/dev/work/" class="${cur === "work" ? "is-current" : ""}">Work</a><a href="/dev/#services" class="hide-sm">Services</a><a href="/dev/blog/" class="hide-sm${cur === "blog" ? " is-current" : ""}">Insights</a><a href="/dev/#contact" class="nav-go">Start a project</a></nav></div></header>`;

const FOOTER = `<footer class="foot"><div class="foot-in"><div><p><strong>PROOF</strong>, the Web3 events team at Chris &amp; Partners Inc.</p><p>5F DSM Square, 45 Dokmak-ro 3-gil, Mapo-gu, Seoul</p><p>CEO Seo-jung Na · Business registration 101-87-00658</p></div><ul><li><a href="/dev/work/">Work</a></li><li><a href="/dev/blog/">Insights</a></li><li><a href="/dev/#contact">Contact</a></li></ul><ul><li><a href="https://t.me/walteryoo30" target="_blank" rel="noopener noreferrer">Telegram</a></li><li><a href="mailto:proofevent@gmail.com">proofevent@gmail.com</a></li><li><a href="https://chrisandpartners.co" target="_blank" rel="noopener noreferrer">chrisandpartners.co</a></li></ul></div></footer>`;

const HEAD_ASSETS = `<meta name="robots" content="noindex, nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/dev/site.css">
<meta name="theme-color" content="#F3F0E9">`;

function transform(html, section) {
  let out = html;
  // GTM (head script + noscript iframe)
  out = out.replace(/<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->\n?/, "");
  out = out.replace(/<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->\n?/, "");
  out = out.replace(/<script>\(function\(w,d,s,l,i\)[\s\S]*?GTM-[A-Z0-9]+'\);<\/script>\n?/, "");
  out = out.replace(/<noscript><iframe src="https:\/\/www\.googletagmanager\.com[\s\S]*?<\/noscript>/, "");
  // head: robots, fonts, stylesheets, theme colour
  out = out.replace(/<meta name="robots"[^>]*>\n?/g, "");
  out = out.replace(/<meta name="(color-scheme|theme-color)"[^>]*>\n?/g, "");
  out = out.replace(/<link rel="preconnect"[^>]*>\n?/g, "");
  out = out.replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>\n?/g, "");
  out = out.replace(/<link rel="stylesheet" href="\/(blog\/blog|work\/work)\.css">\n?/g, "");
  out = out.replace("</head>", `${HEAD_ASSETS}\n</head>`);
  // per-page accent from the old system is not used
  out = out.replace(/<body([^>]*?) style="--acc:[^"]*"/, "<body$1");
  // nav + footer
  out = out.replace(/<nav class="nav"[\s\S]*?<\/div>\s*<\/nav>/, NAV(section));
  out = out.replace(/<footer class="ft"[\s\S]*?<\/footer>/, FOOTER);
  out = out.replace("<main>", '<main class="page">');
  // unverified testimonial quotes
  out = out.replace(/<blockquote class="case-quote">[\s\S]*?<\/blockquote>\n?/g, "");
  // keep internal navigation inside /dev/ (pages only; images/css stay on their real paths)
  out = out.replace(/href="\/(#[^"]*)?"/g, (_, h) => `href="/dev/${h || ""}"`);
  out = out.replace(/href="\/(blog|work)\/([^"]*?\.html|)(#[^"]*)?"/g, (_, s, f, h) => `href="/dev/${s}/${f}${h || ""}"`);
  return out;
}

let n = 0;
for (const section of SECTIONS) {
  const src = path.join(ROOT, section);
  const dst = path.join(ROOT, "dev", section);
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(src).filter((f) => f.endsWith(".html"))) {
    fs.writeFileSync(path.join(dst, f), transform(fs.readFileSync(path.join(src, f), "utf8"), section));
    n++;
  }
}
console.log(`build-dev: mirrored ${n} pages into /dev/`);
