# PROOF — static site

Single-page marketing site for PROOF (Chris & Partners Web3 events). Served as static HTML.

## Repository layout

```
.
├── index.html          # Main page (was proof_v5.html in local drafts)
├── .nojekyll           # Lets GitHub Pages serve static files without Jekyll
├── images/             # All assets referenced by index.html
│   ├── README.md       # Asset checklist / naming notes
│   ├── hero.jpeg
│   ├── expertise-01.jpg … expertise-04.jpg
│   ├── work-01.jpg … work-06.jpg  (work-03 is .jpeg)
│   ├── about.jpg
│   └── cta.jpg
├── .gitignore
└── README.md
```

## GitHub — new repository

1. On GitHub: **New repository** (e.g. `proof-site`). Do **not** add README/license if you will push this folder as the first commit.
2. In this folder:

```bash
cd /Users/chrismini-home/Documents/Cursor/proof
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

(If this folder is not a git repo yet: `git init`, then `git add .` and `git commit -m "Initial commit"`, then `git branch -M main` before adding `origin`.)

## GitHub Pages

1. Repo **Settings → Pages**.
2. **Build and deployment**: Source **Deploy from a branch**, branch **main**, folder **/ (root)**.
3. Site URL will be `https://YOUR_USER.github.io/YOUR_REPO/`.

Then in `index.html`, set **absolute** URLs for social previews (search for `og:image` / `twitter:image`) so cards show the hero image correctly, e.g. `https://YOUR_USER.github.io/YOUR_REPO/images/hero.jpeg`.

## Contact form (Web3Forms)

The form uses `data-web3forms-key` on `#inquiryForm`. In the [Web3Forms dashboard](https://web3forms.com), add your GitHub Pages domain to the allowed domains list.

## Local preview

Open `index.html` in a browser, or from this directory:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080` (some features behave more reliably over `http://` than `file://`).
