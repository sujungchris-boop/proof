# PROOF — Paid Search Launch Checklist

Goal: paid search ads can run with **trustworthy conversion tracking** and a **landing page that converts**. Work through this before turning ads on.

---

## 1. Conversion tracking (GTM-side — do this first)

The site already emits everything needed. The remaining work is **inside the GTM container `GTM-WQP2RKFR`** and **Google Ads `AW-18187497431`** — it cannot be done in the repo.

### dataLayer events the site pushes
| Event name | When | Use as |
|---|---|---|
| `proof_inquiry_submitted` | Web3Forms inquiry submitted successfully | **Primary Ads conversion** |
| `proof_email_click` | A `mailto:` link is clicked (hero/CTA/footer/contact) | Secondary conversion |
| `proof_cta_click` | A primary CTA / nav CTA is clicked | Engagement signal (GA4 funnel) |

`proof_inquiry_submitted` also carries `event_type`, `project_name`, and `contact_email` (the last is for **Enhanced Conversions for leads**).

### Steps in GTM
- [ ] **Custom Event trigger** matching `proof_inquiry_submitted`.
- [ ] **Google Ads Conversion Tracking tag** (the AW-18187497431 conversion action) firing on that trigger.
- [ ] Mark that conversion action **Primary** in Google Ads → Goals.
- [ ] (Recommended) Enable **Enhanced Conversions for leads**: map the `contact_email` dataLayer var into the conversion tag (user-provided data). Lifts attribution materially for lead forms.
- [ ] (Optional) Second Custom Event trigger for `proof_email_click` → a **secondary** Ads conversion (people who email instead of filling the form).
- [ ] Verify in **GTM Preview** + **Google Ads → Diagnostics**: submit a real test inquiry, confirm the tag fires and the conversion records (Ads shows it within ~24h; Tag Assistant immediately).

> Until the Ads conversion action is confirmed firing, do **not** switch campaigns to a conversion-based bidding strategy (Max Conversions / tCPA). Start on Manual CPC or Max Clicks, then move to conversion bidding once data flows.

## 2. GA4
- [ ] Confirm the GA4 config tag is live in the GTM container (per owner: already configured) — verify a `page_view` and the three events above land in **GA4 → Realtime**.
- [ ] In GA4, mark `proof_inquiry_submitted` (and optionally `proof_email_click`) as **Key events**.

## 3. SEO / indexing (done in repo)
- [x] `robots.txt` at root → allows all, points to sitemap.
- [x] `sitemap.xml` at root → single canonical URL `https://proof.chrisandpartners.co/`.
- [ ] After deploy: submit the property + sitemap in **Google Search Console**; request indexing of `/`.
- [ ] Confirm `https://proof.chrisandpartners.co/robots.txt` and `/sitemap.xml` resolve 200 on the live host (GitHub Pages / Vercel both serve root static files).

## 4. Landing-page conversion (done in repo)
- [x] Above-the-fold primary CTA added to hero (**Start a Project** / **See Our Work**) — previously the hero had no CTA.
- [x] Honest claims: title/description/JSON-LD now front TOKEN2049 + KBW **side events** and the **owned Seoul Meta Week** summit; dropped generic "Conference Production / flagship conferences."
- [x] NAP fixed to the Mapo (DSM Square) address in JSON-LD + footer.
- [x] Country count claim removed (now qualitative "Global / Event operations").

## 5. Open items needing the owner's input (do not guess)
- [ ] **Sahara AI attendee number is inconsistent**: Work card #01 says "1,000명" while the testimonial copy says "2,500 people." Same event. Pick the true figure and make both match (and align with the "1,000+" about-stat).
- [ ] **Case KPIs**: add real, verifiable metrics to portfolio cards (attendees / countries / press / partners) — boosts conversion, but only with numbers the team can stand behind.
- [ ] **EN Web3 SEO blog** (mid-term, compounding): the site is a single static `index.html`. Decide a hosting approach before building — e.g. `/blog/*.html` static pages, or a static-site generator. Not launch-critical; sequence it after ads are live and converting.
