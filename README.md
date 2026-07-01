# Opsfinitive website

Static marketing site (5 pages) for Opsfinitive. Built as Design Components (`*.dc.html`) and bundled into self-contained HTML for hosting on Cloudflare Pages.

## Repo layout

**Source (edit these):**
- `Opsfinitive Home.dc.html` — homepage (video hero, outage sandbox, layers, capability matrix, testimonials, FAQ)
- `Plumbline.dc.html` — Plumbline product page
- `Blog.dc.html` — blog index
- `Blog - Top 5 Signs.dc.html`, `Blog - Why DevOps Partner.dc.html` — blog posts
- `SiteNav.dc.html`, `SiteFooter.dc.html` — shared nav/footer components
- `assets/` — hero.mp4, images, avatars
- `support.js`, `image-slot.js` — runtime + web components
- `robots.txt`, `sitemap.xml`, `llms.txt` — SEO / answer-engine artifacts

**Built output (Cloudflare serves this):**
- `deploy/` — self-contained bundled pages with clean filenames:
  - `index.html`, `plumbline.html`, `blog.html`, `blog-top-5-signs.html`, `blog-why-devops-partner.html`
  - `assets/hero.mp4` (kept external so the hero streams and `index.html` stays under Cloudflare's 25 MiB/file limit)
  - `robots.txt`, `sitemap.xml`, `llms.txt`

## Editing workflow

1. Edit the `.dc.html` source files (they open directly in a browser for preview).
2. Re-bundle each edited page into `deploy/` as a self-contained file (inline all assets except the hero video; keep `assets/hero.mp4` external).
3. Cross-links use clean names — `Plumbline.dc.html` → `plumbline.html`, etc.
4. Commit source + `deploy/`.

## Cloudflare Pages

- **Build output directory:** `deploy`
- No build command needed (pre-bundled static files).
- Drag the `deploy/` folder into the Pages dashboard, or `wrangler pages deploy deploy`.
