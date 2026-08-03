import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const projects = JSON.parse(await readFile(path.join(root, "data", "projects.json"), "utf8"));
const required = ["id", "name", "description", "url", "status", "icon", "featured", "order", "stats"];
const ids = new Set();
for (const project of projects) {
  for (const field of required) if (project[field] === undefined || project[field] === "") throw new Error(`${project.id ?? "project"}: missing ${field}`);
  if (ids.has(project.id)) throw new Error(`Duplicate project id: ${project.id}`);
  if (!/^https:\/\//.test(project.url)) throw new Error(`${project.id}: URL must use HTTPS`);
  ids.add(project.id);
}

const escape = (value) => String(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const toolsIcon = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5h16v13H4z"/><path d="M8 9h8M8 12h8M8 15h5"/></svg>`;
const icons = { tools: toolsIcon };
const cards = [...projects].sort((a,b)=>Number(b.featured)-Number(a.featured)||a.order-b.order).map(project => `<article class="project-card${project.featured ? " project-card--featured" : ""}"><div class="project-top"><div class="project-identity"><span class="project-icon">${icons[project.icon] ?? toolsIcon}</span><div><h3>${escape(project.name)}</h3><p>${escape(project.description)}</p></div></div><span class="status">${escape(project.status)}</span></div><div class="project-footer"><span class="stat">${escape(project.stats.label)}</span><a class="button" href="${escape(project.url)}">Open ${escape(project.name)} <span aria-hidden="true">→</span></a></div></article>`).join("\n");
const projectJsonLd = projects.map(project => ({ "@type":"CreativeWork", name:project.name, description:project.description, url:project.url }));
const icon = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>`;
const themeIcon = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3.5"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4"/></svg>`;

const shell = ({title,description,body,canonical="https://tutkutuzlu.github.io/",structured}) => `<!doctype html><html lang="en" data-theme="light" data-theme-preference="system"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><title>${escape(title)}</title><meta name="description" content="${escape(description)}"><link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${canonical}"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/styles.css"><script>try{const p=localStorage.getItem("projects-theme")||"system",r=p==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p;document.documentElement.dataset.themePreference=p;document.documentElement.dataset.theme=r;document.documentElement.style.colorScheme=r}catch{}</script><script type="application/ld+json">${JSON.stringify(structured).replace(/</g,"\\u003c")}</script></head><body><header class="site-header"><div class="container header-inner"><a class="brand" href="/"><span class="brand-mark">${icon}</span><span>Tutku Tuzlu Projects</span></a><div class="header-actions"><nav class="site-nav" aria-label="Primary"><a href="/#projects">Projects</a></nav><details class="theme-menu" data-theme-menu><summary aria-label="Choose theme" title="Choose theme"><span class="icon">${themeIcon}</span></summary><div class="theme-panel" role="radiogroup" aria-label="Theme"><button type="button" role="radio" data-theme="system">System</button><button type="button" role="radio" data-theme="light">Light</button><button type="button" role="radio" data-theme="dark">Dark</button></div></details></div></div></header><main>${body}</main><footer class="site-footer"><div class="container footer-inner"><p>© ${new Date().getUTCFullYear()} Tutku Tuzlu</p><nav class="footer-nav" aria-label="Footer"><a href="https://tutkutuzlu.github.io/alltools/">AllTools</a><a href="https://github.com/tutkutuzlu">GitHub profile</a></nav></div></footer><script type="module" src="/assets/theme.js"></script></body></html>`;
const description = "Independent digital projects, tools and publications built and published by Tutku Tuzlu.";
const home = shell({title:"Tutku Tuzlu Projects – Independent Digital Products",description,body:`<section class="hero"><div class="container hero-inner"><p class="eyebrow">Tutku Tuzlu Projects</p><h1>Independent digital projects, tools and publications.</h1><p class="lead">Useful products built and published by Tutku Tuzlu.</p></div></section><section class="section" id="projects"><div class="container"><div class="section-heading"><p class="eyebrow">Projects</p><h2>Available now</h2><p>Focused digital products that are live and ready to use.</p></div><div class="project-grid">${cards}</div><p class="coming">More projects coming later.</p></div></section>`,structured:{"@context":"https://schema.org","@type":"ProfilePage",name:"Tutku Tuzlu Projects",url:"https://tutkutuzlu.github.io/",mainEntity:{"@type":"Person",name:"Tutku Tuzlu",url:"https://tutkutuzlu.github.io/"},hasPart:projectJsonLd}});
const notFound = shell({title:"Page not found – Tutku Tuzlu Projects",description:"The requested project page could not be found.",canonical:"https://tutkutuzlu.github.io/404.html",body:`<section class="hero"><div class="container hero-inner"><p class="eyebrow">404</p><h1>Page not found.</h1><p class="lead">The page may have moved or may not exist yet.</p><p><a class="button" href="/">Return to projects</a></p></div></section>`,structured:{"@context":"https://schema.org","@type":"WebPage",name:"Page not found"}});

await rm(dist,{recursive:true,force:true}); await mkdir(path.join(dist,"assets"),{recursive:true});
await Promise.all([
  writeFile(path.join(dist,"index.html"),home),writeFile(path.join(dist,"404.html"),notFound),
  writeFile(path.join(dist,"assets","styles.css"),await readFile(path.join(root,"src","styles.css"))),
  writeFile(path.join(dist,"assets","theme.js"),await readFile(path.join(root,"src","theme.js"))),
  writeFile(path.join(dist,"favicon.svg"),await readFile(path.join(root,"src","favicon.svg"))),
  writeFile(path.join(dist,"robots.txt"),"User-agent: *\nAllow: /\nSitemap: https://tutkutuzlu.github.io/sitemap.xml\n"),
  writeFile(path.join(dist,"sitemap.xml"),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://tutkutuzlu.github.io/</loc></url>\n</urlset>\n'),
  writeFile(path.join(dist,".nojekyll"),"")
]);
console.log(`Built portal with ${projects.length} active project(s).`);
