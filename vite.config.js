import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
function offline() {
  const version = Date.now().toString(36);
  return {
    name: "labukas-offline",
    apply: "build",
    transformIndexHtml() {
      return [
        {
          tag: "meta",
          attrs: { name: "app-version", content: version },
          injectTo: "head",
        },
      ];
    },
    async closeBundle() {
      await writeFile("dist/version.json", JSON.stringify({ version }));
      const assets = (await readdir("dist/assets")).map((f) => "/assets/" + f);
      const worker = await readFile("scripts/offline-worker.js", "utf8");
      const hash = createHash("sha256")
        .update(await readFile("dist/index.html"))
        .update(worker)
        .digest("hex")
        .slice(0, 12);
      await writeFile(
        "dist/sw.js",
        worker
          .replace("__BUILD_ID__", hash)
          .replace(
            "__PRECACHE_FILES__",
            JSON.stringify([
              "/",
              "/index.html",
              "/icon.svg",
              "/manifest.webmanifest",
              ...assets,
            ]),
          ),
      );
    },
  };
}
export default defineConfig({
  plugins: [react(), offline()],
  server: { port: 5173 },
});
