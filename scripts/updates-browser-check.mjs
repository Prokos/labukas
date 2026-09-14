import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const template = await readFile("scripts/offline-worker.js", "utf8");
const updates = await readFile("src/app-updates.js", "utf8");
let version = 1;
let unavailable = false;
const files = ["/", "/index.html", "/updates.js"];
const legacy = `const CACHE='labukas-old';self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(${JSON.stringify(files)}))));self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('fetch',e=>{if(e.request.mode==='navigate')e.respondWith(caches.match('/index.html').then(c=>c||fetch(e.request)));});`;
const server = createServer((req, res) => {
  if (unavailable) {
    res.writeHead(503);
    res.end();
    return;
  }
  const path = new URL(req.url, "http://localhost").pathname;
  res.setHeader("Cache-Control", "no-store");
  if (path === "/sw.js" || path === "/updates.js") {
    res.setHeader("Content-Type", "text/javascript");
    res.end(
      path === "/updates.js"
        ? updates
        : version === 1
          ? legacy
          : template
              .replace("__BUILD_ID__", `test-${version}`)
              .replace("__PRECACHE_FILES__", JSON.stringify(files)),
    );
    return;
  }
  res.setHeader("Content-Type", "text/html");
  res.end(
    `<h1>Version ${version}</h1><button id="start">Start lesson</button><button id="end">End lesson</button><script type="module">import {installAppUpdates,setUpdateBusy} from '/updates.js';window.setBusy=setUpdateBusy;document.querySelector('#start').onclick=()=>setUpdateBusy(true);document.querySelector('#end').onclick=()=>setUpdateBusy(false);${version === 1 ? "navigator.serviceWorker.register('/sw.js');" : "setUpdateBusy(false);installAppUpdates();"}</script>`,
  );
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const url = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
});
try {
  const p = await browser.newPage();
  await p.goto(url);
  await p.evaluate(() => navigator.serviceWorker.ready);
  await p.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await p.evaluate(() => {
    localStorage.setItem("labukas.progress.v1", "saved-progress");
    document.cookie = "session=keep-me; path=/";
  });
  version = 2;
  await p.evaluate(async () => {
    const r = await navigator.serviceWorker.getRegistration();
    await r.update();
  });
  await p.waitForFunction(async () =>
    (await caches.keys()).includes("labukas-test-2"),
  );
  await p.waitForFunction(
    async () => !(await caches.keys()).includes("labukas-old"),
  );
  await p.reload();
  await p.getByRole("heading", { name: "Version 2" }).waitFor();
  assert.equal(
    await p.evaluate(() => localStorage.getItem("labukas.progress.v1")),
    "saved-progress",
  );
  assert.ok(
    (await p.evaluate(() => document.cookie)).includes("session=keep-me"),
  );
  // A deployment must not interrupt a lesson, even after the worker activates.
  await p.locator("#start").click();
  version = 3;
  await p.evaluate(async () => {
    const r = await navigator.serviceWorker.getRegistration();
    await r.update();
  });
  await p.waitForFunction(
    async () => !(await caches.keys()).includes("labukas-test-2"),
  );
  await p.waitForTimeout(300);
  assert.equal(await p.locator("h1").innerText(), "Version 2");
  await p.locator("#end").click();
  await p.getByRole("heading", { name: "Version 3" }).waitFor();
  assert.equal(
    await p.evaluate(() => localStorage.getItem("labukas.progress.v1")),
    "saved-progress",
  );
  const fresh = await browser.newPage();
  await fresh.goto(url);
  await fresh.waitForFunction(() =>
    Boolean(navigator.serviceWorker.controller),
  );
  version = 4;
  await fresh.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration.update();
  });
  await fresh.getByRole("heading", { name: "Version 4" }).waitFor();
  await fresh.close();
  unavailable = true;
  await p.reload();
  await p.getByRole("heading", { name: "Version 3" }).waitFor();
  assert.equal(
    await p.evaluate(() => localStorage.getItem("labukas.progress.v1")),
    "saved-progress",
  );
  console.log(
    "PASS: upgrade from the old cache-first worker, automatic update after lesson end, preserved local progress and cookies, cached fallback when the server is unavailable.",
  );
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
