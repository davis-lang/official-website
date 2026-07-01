# Opsfinitive Website

Static marketing site for [Opsfinitive](https://opsfinitive.io). Built as Design Components — DC for short — (`*.dc.html`) and bundled into self-contained HTML, hosted on **Cloudflare Workers**. The `.dc.html` files are the editable source files that can be opened directly in a browser for preview; the bundled output in `deploy/` is what gets served in production.

---

## Table of Contents

- [Repo Layout](#repo-layout)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Deployment Pipeline](#deployment-pipeline)
- [Contributing](#contributing)
- [Branch Strategy](#branch-strategy)
- [Code of Conduct](#code-of-conduct)

---

## Repo Layout

```
├── *.dc.html              # Source pages (edit these)
│   ├── Opsfinitive Home.dc.html    — Homepage
│   ├── Plumbline.dc.html          — Plumbline product page
│   ├── Blog.dc.html               — Blog index
│   ├── Blog - Top 5 Signs.dc.html — Blog post
│   └── Blog - Why DevOps Partner.dc.html — Blog post
├── SiteNav.dc.html        # Shared navigation component
├── SiteFooter.dc.html     # Shared footer component
├── assets/                # Images, hero.mp4, avatars
├── support.js             # Runtime JS
├── image-slot.js          # Web component for images
├── robots.txt             # SEO
├── sitemap.xml            # SEO
├── llms.txt               # Answer-engine artifact
└── deploy/                # Built output — Cloudflare serves this
    ├── index.html
    ├── plumbline.html
    ├── blog.html
    ├── blog-top-5-signs.html
    ├── blog-why-devops-partner.html
    ├── assets/hero.mp4
    ├── robots.txt, sitemap.xml, llms.txt
    └── SiteNav.dc.html, SiteFooter.dc.html
```

---

## Prerequisites

- [Git](https://git-scm.com/)
- A modern browser (Chrome, Firefox, Safari, Edge) for previewing `.dc.html` files
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (optional — only needed if you deploy from your machine)

```bash
npm install -g wrangler
```

---

## Local Development

1. **Clone the repo**
   ```bash
   git clone https://github.com/davis-lang/official-website.git
   cd official-website
   ```

2. **Preview a page** — open any `.dc.html` file directly in your browser. No build step or dev server needed.

3. **Edit source files** — modify the `.dc.html` files as needed. Cross-links between pages use clean names (`plumbline.html`, `blog.html`, etc.).

4. **Re-bundle into `deploy/`** — after editing, regenerate the corresponding page in the `deploy/` directory as a self-contained HTML file:
   - Inline all assets (CSS, JS, images as base64) **except** `assets/hero.mp4` (kept external so `index.html` stays under Cloudflare's 25 MiB/file limit).
   - Ensure cross-links point to clean filenames (e.g. `Plumbline.dc.html` → `plumbline.html`).

5. **Test locally** — open the bundled files in `deploy/` to verify everything renders correctly before committing.

---

## Deployment Pipeline

This project uses **Cloudflare Workers** for hosting. The repo is connected to Cloudflare for automatic builds and deployments.

```
  You edit *.dc.html
       │
       ▼
  Bundle into deploy/
       │
       ▼
  Push to a feature branch
       │
       ▼
  Open a PR against dev → preview deploy
       │
       ▼
  Merge to dev → verify on preview
       │
       ▼
  Maintainer merges dev → main
       │
       ▼
  Cloudflare auto-deploys via
  npx wrangler deploy
       │
       ▼
  Live at opsfinitive.io
```

### How it works

| Setting                       | Value                                         |
|-------------------------------|-----------------------------------------------|
| **Platform**                  | Cloudflare Workers                            |
| **GitHub repo**               | `davis-lang/official-website`                 |
| **Production branch**         | `main`                                        |
| **Preview branches**          | `dev` and any PR branches (auto-enabled)      |
| **Build command**             | _(none)_                                      |
| **Deploy command**            | `npx wrangler deploy`                         |
| **Root directory**            | `/`                                           |

- **Production deploys** happen automatically when commits land on `main`.
- **Preview deploys** are generated for every push to `dev` or any open pull request branch. Cloudflare provides a unique preview URL for each.
- You can also deploy manually: `npx wrangler deploy`

---

## Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started

1. **Fork the repo** — click "Fork" on the [GitHub repo page](https://github.com/davis-lang/official-website).
2. **Clone your fork**
   ```bash
   git clone https://github.com/<your-username>/official-website.git
   cd official-website
   ```
3. **Create a feature branch from `dev`**
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/your-feature-name
   ```

### Making Changes

1. Edit the `.dc.html` source files (not the files in `deploy/` directly).
2. Re-bundle your changes into `deploy/`.
3. Preview locally by opening the bundled file in your browser.
4. Commit both the source files and the updated `deploy/` output.

### Raising a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a PR against the `dev` branch** — go to the repo on GitHub and click "New Pull Request". Set the base branch to `dev`.

3. **PR requirements:**
   - Title should be clear and descriptive (e.g. "Add testimonial section to homepage")
   - Description should explain **what** changed and **why**
   - Include a screenshot or screen recording if the change is visual
   - Ensure both source (`.dc.html`) and built output (`deploy/`) are included
   - Keep PRs focused — one feature or fix per PR

4. **Review process:**
   - A maintainer will review your PR
   - Cloudflare Pages will generate a **preview deploy** so the reviewer can see your changes live
   - Address any requested changes by pushing additional commits to your branch
   - Once approved, a maintainer will merge your PR into `dev`

5. **Do not push directly to `main`** — all changes must go through a PR into `dev` first.

### Contribution Rules

- **Never edit `deploy/` files directly** — always edit the `.dc.html` source, then bundle.
- **Never push directly to `main` or `dev`** — always use a feature branch + PR.
- **Keep commits atomic** — each commit should represent a single logical change.
- **Test your changes** — open the bundled output in a browser before submitting.

---

## Branch Strategy

```
main  ◄──── production (auto-deploys to opsfinitive.io)
 │
 └── dev  ◄──── integration branch (preview deploys)
      │
      ├── feature/your-feature  ◄── your work goes here
      ├── fix/bug-description
      └── ...
```

| Branch    | Purpose                          | Deploys to                          | Who can push |
|-----------|----------------------------------|-------------------------------------|--------------|
| `main`    | Production                       | `opsfinitive.io`                   | Maintainers only (via merge from `dev`) |
| `dev`     | Integration / staging            | Preview URL on Cloudflare Pages     | Via PR only  |
| `feature/*`, `fix/*` | Individual work       | Preview URL per PR                  | Contributors |

### Workflow Summary

1. Branch off `dev` → work on your feature branch
2. Open a PR against `dev` → get a preview deploy + code review
3. Merge into `dev` → verify on the preview environment
4. Maintainer merges `dev` into `main` → goes live

---

## Code of Conduct

Be respectful and constructive. We're building something together — keep feedback kind, PRs focused, and communication clear.
