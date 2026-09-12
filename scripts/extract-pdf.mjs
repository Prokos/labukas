import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { readFile, writeFile } from "node:fs/promises";
const pdf = await getDocument({
  data: new Uint8Array(await readFile("LANGAS.pdf")),
  useSystemFonts: true,
}).promise;
let output = "";
for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const c = await page.getTextContent();
  output +=
    `\n\n--- PAGE ${i} ---\n` +
    c.items.map((x) => x.str + (x.hasEOL ? "\n" : " ")).join("");
}
await writeFile("/private/tmp/labukas-curriculum.txt", output);
console.log(`${pdf.numPages} pages extracted`);
