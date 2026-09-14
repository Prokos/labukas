import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
function offline() {
  return {
    name: "labukas-offline",
    apply: "build",
    async closeBundle() {
      const assets = (await readdir("dist/assets")).map((f) => "/assets/" + f);
      const hash = createHash("sha256")
        .update(await readFile("dist/index.html"))
        .digest("hex")
        .slice(0, 12);
      // Bundled assets are immutable public files. Ignore Vary (for example
      // Origin from a preview server) when matching their precached responses.
      await writeFile(
        "dist/sw.js",
        `const CACHE='labukas-${hash}';const FILES=${JSON.stringify(["/", "/index.html", "/icon.svg", "/manifest.webmanifest", ...assets])};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('labukas-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;if(e.request.mode==='navigate'){e.respondWith(caches.match('/index.html').then(c=>c||fetch(e.request)));return;}e.respondWith(caches.open(CACHE).then(cache=>cache.match(e.request,{ignoreVary:true})).then(c=>c||fetch(e.request)));});`,
      );
    },
  };
}
export default defineConfig({
  plugins: [react(), offline()],
  server: { port: 5173 },
});
