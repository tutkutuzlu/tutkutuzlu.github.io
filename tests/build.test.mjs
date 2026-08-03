import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import path from "node:path";
const exec=promisify(execFile),root=path.resolve(import.meta.dirname,"..");
test("builds an accessible, data-driven root portal",async()=>{await exec(process.execPath,[path.join(root,"scripts","build.mjs")],{cwd:root});const html=await readFile(path.join(root,"dist","index.html"),"utf8"),robots=await readFile(path.join(root,"dist","robots.txt"),"utf8"),sitemap=await readFile(path.join(root,"dist","sitemap.xml"),"utf8");assert.match(html,/Independent digital projects, tools and publications/);assert.match(html,/Open AllTools/);assert.match(html,/19 tools/);assert.match(html,/https:\/\/tutkutuzlu\.github\.io\/alltools\//);assert.match(html,/application\/ld\+json/);assert.doesNotMatch(html,/googletagmanager|google-analytics|AltWorld|Activity Books/);assert.match(robots,/Allow: \//);assert.match(sitemap,/https:\/\/tutkutuzlu\.github\.io\//);});
