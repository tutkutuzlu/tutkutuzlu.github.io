import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import path from "node:path";
const exec=promisify(execFile),root=path.resolve(import.meta.dirname,"..");
test("builds an accessible, data-driven root portal",async()=>{await exec(process.execPath,[path.join(root,"scripts","build.mjs")],{cwd:root});const html=await readFile(path.join(root,"dist","index.html"),"utf8"),robots=await readFile(path.join(root,"dist","robots.txt"),"utf8"),sitemap=await readFile(path.join(root,"dist","sitemap.xml"),"utf8");assert.match(html,/Independent digital projects, tools and publications/);assert.match(html,/Open AllTools/);assert.match(html,/19 tools/);assert.match(html,/https:\/\/tutkutuzlu\.github\.io\/alltools\//);assert.match(html,/application\/ld\+json/);assert.doesNotMatch(html,/googletagmanager|google-analytics|AltWorld|Activity Books/);assert.match(robots,/Allow: \//);assert.match(sitemap,/https:\/\/tutkutuzlu\.github\.io\//);});

test("AdSense is production-only and ads.txt identifies the authorized seller",async()=>{const adsRecord="google.com, pub-8757964996370629, DIRECT, f08c47fec0942fa0\n";await exec(process.execPath,[path.join(root,"scripts","build.mjs")],{cwd:root});let html=await readFile(path.join(root,"dist","index.html"),"utf8");assert.doesNotMatch(html,/pagead2\.googlesyndication|adsbygoogle/);assert.equal(await readFile(path.join(root,"dist","ads.txt"),"utf8"),adsRecord);await exec(process.execPath,[path.join(root,"scripts","build.mjs"),"--production"],{cwd:root});for(const page of ["index.html","404.html"]){html=await readFile(path.join(root,"dist",page),"utf8");assert.equal((html.match(/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-8757964996370629/g)??[]).length,1);assert.match(html,/crossorigin="anonymous"><\/script><\/head>/);}});
