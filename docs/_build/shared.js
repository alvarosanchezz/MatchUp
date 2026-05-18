/**
 * shared.js — Helpers, constantes y estilos compartidos para la generación de la memoria
 */
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, ExternalHyperlink,
  TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageBreak, PageNumber
} = require("docx");

// ═══════════════════════════════════════════════════════════════════════════
const BLUE_DARK = "1E3A5F";
const BLUE_MID = "2E75B6";
const ORANGE = "F57C00";
const GRAY = "6B7280";
const LIGHT_BG = "F0F4F8";
const WHITE = "FFFFFF";
const GREEN = "16A34A";

const PAGE_W = 11906;
const PAGE_H = 16838;
const MARGIN = 1440;
const CONTENT_W = PAGE_W - MARGIN * 2;

const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════
function p(text, opts = {}) {
  const resolvedRuns = Array.isArray(text)
    ? text
    : [new TextRun({ text, size: opts.size || 24, font: "Arial", color: opts.color, bold: opts.bold, italics: opts.italics })];
  return new Paragraph({
    children: resolvedRuns,
    spacing: { after: opts.after !== undefined ? opts.after : 200, before: opts.before || 0, line: opts.line || 276 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    ...(opts.heading ? { heading: opts.heading } : {}),
    ...(opts.numbering ? { numbering: opts.numbering } : {}),
    ...(opts.pageBreakBefore ? { pageBreakBefore: true } : {}),
    ...(opts.indent ? { indent: opts.indent } : {}),
  });
}

function h1(text) { return p(text, { heading: HeadingLevel.HEADING_1, bold: true, color: BLUE_DARK, after: 240, before: 360, align: AlignmentType.LEFT }); }
function h2(text) { return p(text, { heading: HeadingLevel.HEADING_2, bold: true, color: BLUE_DARK, after: 200, before: 240, align: AlignmentType.LEFT }); }
function h3(text) { return p(text, { heading: HeadingLevel.HEADING_3, bold: true, color: BLUE_MID, after: 160, before: 200, align: AlignmentType.LEFT }); }

function runs(...parts) {
  return parts.map(part => {
    if (typeof part === "string") return new TextRun({ text: part, size: 24, font: "Arial" });
    return new TextRun({ size: 24, font: "Arial", ...part });
  });
}

function bold(text) { return { text, bold: true, size: 24, font: "Arial" }; }

function code(text) { return { text, font: "Consolas", size: 20, color: BLUE_DARK }; }

function headerCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: BLUE_DARK, type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: WHITE, size: 22, font: "Arial" })], alignment: AlignmentType.CENTER })],
  });
}

function dataCell(text, width, opts = {}) {
  const cellChildren = opts.children || [new Paragraph({
    children: [new TextRun({ text: String(text), size: 22, font: "Arial", bold: opts.bold, color: opts.color })],
    alignment: opts.align || AlignmentType.LEFT
  })];
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    children: cellChildren,
  });
}

function multiLineCell(lines, width, opts = {}) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    children: lines.map(line => new Paragraph({
      children: [new TextRun({ text: line, size: 22, font: "Arial" })],
      spacing: { after: 40 },
    })),
  });
}

function figuraPlaceholder(numero, pie) {
  return [
    new Paragraph({ spacing: { before: 200, after: 60 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: `[Insertar captura - Figura ${numero}]`, size: 22, font: "Arial", italics: true, color: GRAY }),
    ]}),
    new Paragraph({ spacing: { after: 200 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: `Figura ${numero}. `, bold: true, size: 20, font: "Arial", color: GRAY }),
      new TextRun({ text: pie, size: 20, font: "Arial", color: GRAY }),
    ]}),
  ];
}

function codeBlock(lines) {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    indent: { left: 360 },
    children: lines.map((line, i) => new TextRun({
      text: line + (i < lines.length - 1 ? "\n" : ""),
      font: "Consolas", size: 18, color: BLUE_DARK,
    })),
  });
}

function pageBreak() { return new Paragraph({ children: [new PageBreak()] }); }

function makeTable(colWidths, headerTexts, rows) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({ children: headerTexts.map((t, i) => headerCell(t, colWidths[i])) }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((cell, ci) => {
          const isObj = typeof cell === "object" && cell !== null && !Array.isArray(cell);
          const text = isObj ? cell.text : String(cell);
          const opts = isObj ? cell : {};
          return dataCell(text, colWidths[ci], {
            bold: opts.bold, align: opts.align || (ci === 0 ? AlignmentType.CENTER : AlignmentType.LEFT),
            shading: ri % 2 === 0 ? "F8FAFC" : undefined, color: opts.color
          });
        })
      })),
    ],
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════
function buildDocStyles() {
  return {
    default: { document: { run: { font: "Arial", size: 24 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: BLUE_DARK },
        paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: "Arial", color: BLUE_DARK },
        paragraph: { spacing: { before: 240, after: 200 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: BLUE_MID },
        paragraph: { spacing: { before: 200, after: 160 }, outlineLevel: 2 } },
    ],
  };
}

function buildNumbering() {
  return {
    config: [{
      reference: "bullets",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
    }],
  };
}

function makeHeader() {
  return new Header({
    children: [new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BLUE_MID, space: 4 } },
      spacing: { after: 0 },
      children: [
        new TextRun({ text: "MatchUp", font: "Arial", size: 18, bold: true, color: BLUE_MID }),
        new TextRun({ text: "  |  Memoria TFG  |  Alvaro Sanchez Rodriguez", font: "Arial", size: 16, color: GRAY }),
      ],
    })],
  });
}

function makeFooter() {
  return new Footer({
    children: [new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 2, color: "E5E7EB", space: 4 } },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "Pagina ", font: "Arial", size: 18, color: GRAY }),
        new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: GRAY }),
      ],
    })],
  });
}

function contentSection(children) {
  return {
    properties: {
      page: { size: { width: PAGE_W, height: PAGE_H }, margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN } },
    },
    headers: { default: makeHeader() },
    footers: { default: makeFooter() },
    children,
  };
}

module.exports = {
  BLUE_DARK, BLUE_MID, ORANGE, GRAY, LIGHT_BG, WHITE, GREEN,
  PAGE_W, PAGE_H, MARGIN, CONTENT_W,
  borders, cellMargins,
  p, h1, h2, h3, runs, bold, code, headerCell, dataCell, multiLineCell,
  figuraPlaceholder, codeBlock, pageBreak, makeTable,
  buildDocStyles, buildNumbering, makeHeader, makeFooter, contentSection,
  // Re-export docx for convenience
  ...require("docx"),
};
