#!/usr/bin/env node
/**
 * build.mjs — turn the .dc.html sources into a deployable deploy/ folder.
 *
 * Run from the repo root:   node build.mjs
 *
 * What it does (this is the whole "bundling" process):
 *   1. Copies each page .dc.html -> deploy/<clean-name>.html
 *   2. Rewrites every cross-page link from "<Page>.dc.html" to the clean name
 *      (both raw and %20-encoded forms), in the pages AND in the shared
 *      SiteNav / SiteFooter components.
 *   3. Copies the DC runtime (support.js, image-slot.js) into deploy/.
 *   4. Copies the shared SiteNav.dc.html / SiteFooter.dc.html into deploy/
 *      (the runtime fetches these by name at page load, so they must be present).
 *   5. Copies assets/ (hero.mp4, logos, blog images, avatars, og-image) into deploy/assets/.
 *   6. Copies robots.txt, sitemap.xml, llms.txt into deploy/.
 *
 * The output pages are still rendered client-side by support.js (same as in dev) —
 * this build just gives everything clean URLs and puts every dependency in one folder.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'deploy');

// page source  ->  clean output filename
const PAGES = {
  'Opsfinitive Home.dc.html': 'index.html',
  'Plumbline.dc.html': 'plumbline.html',
  'Blog.dc.html': 'blog.html',
  'Blog - Top 5 Signs.dc.html': 'blog-top-5-signs.html',
  'Blog - Why DevOps Partner.dc.html': 'blog-why-devops-partner.html',
  'Blog - What Is Agentic Ops Governance.dc.html': 'blog-what-is-agentic-ops-governance.html',
  'Blog - Reduce LLM Token Costs.dc.html': 'blog-reduce-llm-token-costs.html',
  'Blog - Sovereign AI Agents Air-Gapped.dc.html': 'blog-sovereign-ai-agents-air-gapped.html',
  'Blog - Engineering-First vs API Wrapper.dc.html': 'blog-engineering-first-vs-api-wrapper.html',
};

// shared components fetched by the runtime at load time — copied as-is (name kept),
// but their internal links are rewritten too.
const COMPONENTS = ['SiteNav.dc.html', 'SiteFooter.dc.html'];

const RUNTIME = ['support.js', 'image-slot.js'];
const SEO = ['robots.txt', 'sitemap.xml', 'llms.txt'];

// link rewrites — ORDER MATTERS: longest / most-specific first so e.g.
// "Blog - Top 5 Signs.dc.html" is matched before "Blog.dc.html".
const LINK_MAP = [
  ['Blog%20-%20What%20Is%20Agentic%20Ops%20Governance.dc.html', 'blog-what-is-agentic-ops-governance.html'],
  ['Blog - What Is Agentic Ops Governance.dc.html', 'blog-what-is-agentic-ops-governance.html'],
  ['Blog%20-%20Reduce%20LLM%20Token%20Costs.dc.html', 'blog-reduce-llm-token-costs.html'],
  ['Blog - Reduce LLM Token Costs.dc.html', 'blog-reduce-llm-token-costs.html'],
  ['Blog%20-%20Sovereign%20AI%20Agents%20Air-Gapped.dc.html', 'blog-sovereign-ai-agents-air-gapped.html'],
  ['Blog - Sovereign AI Agents Air-Gapped.dc.html', 'blog-sovereign-ai-agents-air-gapped.html'],
  ['Blog%20-%20Engineering-First%20vs%20API%20Wrapper.dc.html', 'blog-engineering-first-vs-api-wrapper.html'],
  ['Blog - Engineering-First vs API Wrapper.dc.html', 'blog-engineering-first-vs-api-wrapper.html'],
  ['Blog%20-%20Top%205%20Signs.dc.html', 'blog-top-5-signs.html'],
  ['Blog - Top 5 Signs.dc.html', 'blog-top-5-signs.html'],
  ['Blog%20-%20Why%20DevOps%20Partner.dc.html', 'blog-why-devops-partner.html'],
  ['Blog - Why DevOps Partner.dc.html', 'blog-why-devops-partner.html'],
  ['Plumbline.dc.html', 'plumbline.html'],
  ['Blog.dc.html', 'blog.html'],
  ['Opsfinitive%20Home.dc.html', 'index.html'],
  ['Opsfinitive Home.dc.html', 'index.html'],
];

function rewriteLinks(html) {
  for (const [from, to] of LINK_MAP) html = html.split(from).join(to);
  return html;
}

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  for (const entry of await fs.readdir(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) await copyDir(s, d);
    else await fs.copyFile(s, d);
  }
}

async function main() {
  // fresh deploy/
  await fs.rm(OUT, { recursive: true, force: true });
  await fs.mkdir(OUT, { recursive: true });

  // 1 + 2: pages, with clean names and rewritten links
  for (const [src, out] of Object.entries(PAGES)) {
    if (!(await exists(path.join(ROOT, src)))) {
      console.warn(`! missing page: ${src} (skipped)`);
      continue;
    }
    const html = rewriteLinks(await fs.readFile(path.join(ROOT, src), 'utf8'));
    await fs.writeFile(path.join(OUT, out), html);
    console.log(`page   ${src}  ->  deploy/${out}`);
  }

  // 4 (+ link rewrite): shared components, name kept
  for (const c of COMPONENTS) {
    if (!(await exists(path.join(ROOT, c)))) { console.warn(`! missing component: ${c}`); continue; }
    const html = rewriteLinks(await fs.readFile(path.join(ROOT, c), 'utf8'));
    await fs.writeFile(path.join(OUT, c), html);
    console.log(`comp   ${c}`);
  }

  // 3: runtime
  for (const r of RUNTIME) {
    if (!(await exists(path.join(ROOT, r)))) { console.warn(`! missing runtime: ${r}`); continue; }
    await fs.copyFile(path.join(ROOT, r), path.join(OUT, r));
    console.log(`js     ${r}`);
  }

  // 5: assets
  if (await exists(path.join(ROOT, 'assets'))) {
    await copyDir(path.join(ROOT, 'assets'), path.join(OUT, 'assets'));
    console.log('assets/  copied');
  }

  // 6: SEO files
  for (const s of SEO) {
    if (!(await exists(path.join(ROOT, s)))) { console.warn(`! missing SEO file: ${s}`); continue; }
    await fs.copyFile(path.join(ROOT, s), path.join(OUT, s));
    console.log(`seo    ${s}`);
  }

  console.log('\n✓ deploy/ built. Point Cloudflare Pages output dir at "deploy".');
}

main().catch((e) => { console.error(e); process.exit(1); });
