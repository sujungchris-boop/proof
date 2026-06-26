# PROOF — SEO Content Plan

Strategy rationale: relevant head terms have near-zero search volume **and** no competition. So search (ads *and* SEO) is a cheap **capture** layer, not a demand engine. SEO effort is aimed only where real intent or defensibility exists:

1. **Korea market-entry intent** — small but real volume, very high intent, proof's defensible niche (the home brand can't own this angle).
2. **Brand / event-name SERP ownership** — defend "PROOF", "Seoul Meta Week", client/event names.
3. **Citable, shareable playbooks** — content that gets passed around in Telegram/X. Value = being the reference, not the AdWords slot.

Each post: English-first, design-consistent (`blog/blog.css`), unique title/meta/canonical, Article + Breadcrumb (+ FAQ where natural) JSON-LD, added to `sitemap.xml`, internal-linked from nav/footer. No build step — copy an existing `blog/*.html` to add a post.

## Intent / keyword map (seed list — validate with ads Search Terms + Search Console)

| Cluster | Example queries | Intent | Use |
|---|---|---|---|
| Korea entry | "enter Korea crypto market", "launch web3 project korea", "korea blockchain marketing agency" | High | SEO cornerstone + ads |
| KBW / side events | "Korea Blockchain Week side event", "KBW sponsorship", "web3 side event seoul" | High | SEO + ads |
| TOKEN2049 ops | "TOKEN2049 side event agency", "TOKEN2049 booth", "side event venue singapore" | High | SEO + ads |
| Booth / activation | "crypto booth agency", "web3 activation agency", "conference booth production" | Med | SEO + ads |
| Investor dinner | "web3 investor dinner", "crypto private event seoul" | Med | SEO |
| Brand defense | "PROOF web3", "Seoul Meta Week organizer", "[client] event" | Nav/brand | SEO (must own) |

## Roadmap (priority order)

- [x] **#1 Korea market-entry playbook** → `blog/korea-web3-market-entry.html` (cornerstone, FAQ schema).
- [x] **#2 How to run a KBW / Korea Blockchain Week side event** → `blog/kbw-side-event-guide.html` (FAQ schema; internal-links #1).
- [x] **#3 TOKEN2049 side events: the operator's checklist** → `blog/token2049-side-event-checklist.html` (FAQ schema; internal-links #1/#2).
- [x] **#4 Booth vs side event vs dinner: choosing the right Web3 activation** → `blog/choosing-a-web3-activation.html` (decision framework + FAQ schema; internal-links #1/#2/#3).
- [x] **#5 Why Seoul is a Web3 hub** — broader awareness piece, links the cluster together; earns links. -> blog/why-seoul-is-a-web3-hub.html
- [ ] **#6 How to run a Web3 investor dinner that actually converts** — the high-signal format; guest curation, pacing, follow-up. Internal-links #4.
- [ ] **#7 The Web3 conference booth playbook** — build, staffing, and standing out on a noisy floor. Internal-links #3/#4.
- [ ] **#8 KBW vs TOKEN2049: where should your Web3 project show up?** — comparison/decision piece. Internal-links #2/#3.
- [ ] **#9 What a Web3 event really costs** — budget breakdown by format (booth / side event / dinner / activation). Internal-links #4.
- [ ] **#10 A foreign project's first event in Korea: the venue & vendor guide** — the access problem, solved. Internal-links #1.
- [ ] **#11 Web3 brand activations that work (and the ones that don't)** — experiential moments with substance. Internal-links #4.
- [ ] **#12 The post-event playbook: turning a Web3 event into pipeline** — capture and follow-up. Internal-links #2/#6.

> Auto-published biweekly by the `blog-autopublish` scheduled routine (see below). The routine picks the next unchecked item, writes + publishes it, and ticks it here. Keep this list stocked so the routine never runs dry.

## Measurement
- Run ads at low budget as a **demand probe** first (cheap — no competition). The Search Terms report tells us which clusters actually get searched → reprioritize this list against real data.
- Track organic landings + the dataLayer events (`proof_inquiry_submitted`, `proof_email_click`) by source in GA4.
