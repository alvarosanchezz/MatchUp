/**
 * generate-all.js — Genera la memoria completa de MatchUp
 * Ejecutar: node generate-all.js
 */
const fs = require("fs");
const path = require("path");
const S = require("./shared");
const { buildPortada, buildTOC, buildCapitulo1 } = require("./cap1");
const { buildCapitulo2 } = require("./cap2");
const { buildConclusiones } = require("./cap3");
const { buildBibliografia, buildAnexos } = require("./cap4");

async function main() {
  console.log("Generando memoria MatchUp completa...");

  const doc = new S.Document({
    creator: "Alvaro Sanchez Rodriguez",
    title: "MatchUp - Memoria TFG DAW",
    description: "Trabajo Fin de Grado - Plataforma web de quedadas deportivas",
    styles: S.buildDocStyles(),
    numbering: S.buildNumbering(),
    sections: [
      {
        properties: {
          page: {
            size: { width: S.PAGE_W, height: S.PAGE_H },
            margin: { top: S.MARGIN, right: S.MARGIN, bottom: S.MARGIN, left: S.MARGIN },
          },
        },
        children: buildPortada(),
      },
      S.contentSection(buildTOC()),
      S.contentSection(buildCapitulo1()),
      S.contentSection(buildCapitulo2()),
      S.contentSection(buildConclusiones()),
      S.contentSection(buildBibliografia()),
      S.contentSection(buildAnexos()),
    ],
  });

  const buffer = await S.Packer.toBuffer(doc);
  const outPath = path.join(__dirname, "..", "memoria-MatchUp.docx");
  fs.writeFileSync(outPath, buffer);
  console.log("OK - Memoria generada en: " + outPath);
  console.log("Tamano: " + (buffer.length / 1024).toFixed(1) + " KB");
}

main().catch(function(err) {
  console.error("ERROR:", err.message);
  console.error(err.stack);
  process.exit(1);
});
