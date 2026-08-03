import { spawn } from "node:child_process";
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[path.join(root,"scripts","build.mjs")],{stdio:"inherit"});child.on("exit",code=>code===0?resolve():reject(new Error(`Build failed: ${code}`)));});
const types={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".xml":"application/xml; charset=utf-8",".txt":"text/plain; charset=utf-8",".svg":"image/svg+xml"};
http.createServer(async(req,res)=>{try{let pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);let file=path.join(root,"dist",pathname.replace(/^\//,""));if((await stat(file).catch(()=>null))?.isDirectory())file=path.join(file,"index.html");const body=await readFile(file);res.writeHead(200,{"content-type":types[path.extname(file)]||"application/octet-stream"});res.end(body);}catch{const body=await readFile(path.join(root,"dist","404.html"));res.writeHead(404,{"content-type":"text/html; charset=utf-8"});res.end(body);}}).listen(4180,()=>console.log("Portal: http://localhost:4180/"));
