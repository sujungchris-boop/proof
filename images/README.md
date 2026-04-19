# PROOF site images

Place files **next to** `index.html` under this `images/` folder. HTML uses **exact paths** — names and extensions must match (macOS is case-sensitive on some volumes).

## Files referenced in `index.html`

| File | Section |
|------|---------|
| `hero.jpeg` | Hero (also `og:image` / `twitter:image`) |
| `expertise-01.jpg` … `expertise-04.jpg` | Expertise |
| `work-01.jpg` … `work-06.jpg` | Work — **`work-03`** is `work-03.jpeg` in HTML |
| `about.jpg` | About |
| `cta.jpg` | CTA |

## Common issues

- **`hero.jpg` vs `hero.jpeg`** — HTML expects **`hero.jpeg`** if that is what you exported.
- **`work-03.jpeg`** — If your file is JPEG but named `.jpeg`, keep that name or rename to match the HTML `src`.
- **`about.jpg` / `cta.jpg`** — If you only have other filenames, either **rename** your files to the names above or **change the `src` in HTML** to match your filenames (avoid spaces in names for fewer bugs; use hyphens).

## Add another Work item

Save e.g. `images/work-07.jpg`, duplicate an `<article class="wi rv">…</article>` block in `index.html`, and update `src`, copy, and `data-parallax`.

## GitHub Pages / social previews

After deploy, set **absolute** URLs in `<head>` for `og:image` / `twitter:image` (e.g. `https://USER.github.io/REPO/images/hero.jpeg`).
