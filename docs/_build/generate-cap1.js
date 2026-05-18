/**
 * generate-cap1.js
 * Genera el Capítulo 1 de la memoria TFG de MatchUp
 * Requiere: npm install docx
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageBreak, PageNumber, ImageRun
} = require("docx");

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════
const BLUE_DARK = "1E3A5F";
const BLUE_MID = "2E75B6";
const ORANGE = "F57C00";
const GRAY = "6B7280";
const LIGHT_BG = "F0F4F8";
const WHITE = "FFFFFF";

// A4 en DXA
const PAGE_W = 11906;
const PAGE_H = 16838;
const MARGIN = 1440; // 1 inch = 2.54 cm
const CONTENT_W = PAGE_W - MARGIN * 2; // 9026

// Bordes de tabla
const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const noBorders = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════
function p(text, opts = {}) {
  const runs = Array.isArray(text)
    ? text
    : [new TextRun({ text, size: opts.size || 24, font: "Arial", color: opts.color, bold: opts.bold, italics: opts.italics })];
  return new Paragraph({
    children: runs,
    spacing: { after: opts.after !== undefined ? opts.after : 200, before: opts.before || 0, line: opts.line || 276 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    ...(opts.heading ? { heading: opts.heading } : {}),
    ...(opts.numbering ? { numbering: opts.numbering } : {}),
    ...(opts.pageBreakBefore ? { pageBreakBefore: true } : {}),
    ...(opts.indent ? { indent: opts.indent } : {}),
  });
}

function heading(text, level) {
  const sizes = { 1: 36, 2: 30, 3: 26 };
  return p(text, { heading: level, size: sizes[level === HeadingLevel.HEADING_1 ? 1 : level === HeadingLevel.HEADING_2 ? 2 : 3], bold: true, color: BLUE_DARK, after: 200, before: level === HeadingLevel.HEADING_1 ? 360 : 240, align: AlignmentType.LEFT });
}

function h1(text) { return heading(text, HeadingLevel.HEADING_1); }
function h2(text) { return heading(text, HeadingLevel.HEADING_2); }
function h3(text) { return heading(text, HeadingLevel.HEADING_3); }

function runs(...parts) {
  return parts.map(part => {
    if (typeof part === "string") return new TextRun({ text: part, size: 24, font: "Arial" });
    return new TextRun({ size: 24, font: "Arial", ...part });
  });
}

function bold(text) { return { text, bold: true, size: 24, font: "Arial" }; }

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
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    children: [new Paragraph({
      children: [new TextRun({ text: String(text), size: 22, font: "Arial", bold: opts.bold, color: opts.color })],
      alignment: opts.align || AlignmentType.LEFT
    })],
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

// ═══════════════════════════════════════════════════════════════════════════
// PORTADA
// ═══════════════════════════════════════════════════════════════════════════
function buildPortada() {
  return [
    new Paragraph({ spacing: { before: 2400 }, children: [] }),
    // Linea decorativa superior
    new Paragraph({
      spacing: { after: 400 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: BLUE_MID, space: 1 } },
      children: [],
    }),
    new Paragraph({
      spacing: { after: 100 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "TRABAJO FIN DE GRADO", size: 28, font: "Arial", color: GRAY, bold: true })],
    }),
    new Paragraph({
      spacing: { after: 100 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Desarrollo de Aplicaciones Web", size: 24, font: "Arial", color: GRAY })],
    }),
    new Paragraph({ spacing: { after: 600 }, children: [] }),
    // Titulo
    new Paragraph({
      spacing: { after: 80 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Match", size: 72, font: "Arial", bold: true, color: BLUE_MID })],
    }),
    new Paragraph({
      spacing: { after: 80 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "Match", size: 72, font: "Arial", bold: true, color: BLUE_MID }),
        new TextRun({ text: "Up", size: 72, font: "Arial", bold: true, color: ORANGE }),
      ],
    }),
    new Paragraph({
      spacing: { after: 600 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Plataforma web de quedadas deportivas", size: 28, font: "Arial", color: GRAY, italics: true })],
    }),
    // Datos
    new Paragraph({ spacing: { after: 120 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: "Autor: ", size: 24, font: "Arial", color: GRAY }),
      new TextRun({ text: "Alvaro Sanchez Rodriguez", size: 24, font: "Arial", bold: true, color: BLUE_DARK }),
    ]}),
    new Paragraph({ spacing: { after: 120 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: "Tutor: ", size: 24, font: "Arial", color: GRAY }),
      new TextRun({ text: "Vladimir Rico Hebles", size: 24, font: "Arial", bold: true, color: BLUE_DARK }),
    ]}),
    new Paragraph({ spacing: { after: 120 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: "Centro: ", size: 24, font: "Arial", color: GRAY }),
      new TextRun({ text: "IES Los Alcores", size: 24, font: "Arial", bold: true, color: BLUE_DARK }),
    ]}),
    new Paragraph({ spacing: { after: 120 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: "Curso academico 2025 - 2026", size: 24, font: "Arial", color: GRAY }),
    ]}),
    new Paragraph({ spacing: { after: 400 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: "Mayo 2026", size: 24, font: "Arial", color: GRAY }),
    ]}),
    // Linea decorativa inferior
    new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 12, color: BLUE_MID, space: 1 } },
      children: [],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// TABLA DE CONTENIDOS
// ═══════════════════════════════════════════════════════════════════════════
function buildTOC() {
  return [
    h1("Indice de contenidos"),
    new TableOfContents("Tabla de Contenidos", {
      hyperlink: true,
      headingStyleRange: "1-3",
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// 1.1 INTRODUCCION
// ═══════════════════════════════════════════════════════════════════════════
function buildIntroduccion() {
  return [
    h1("1. Estudio del problema y analisis del sistema"),
    h2("1.1 Introduccion"),

    p(runs(
      "En los ultimos anos, la practica deportiva ha experimentado una transformacion significativa impulsada por la digitalizacion. ",
      "Millones de personas recurren a aplicaciones moviles y plataformas web para gestionar sus rutinas de entrenamiento, ",
      "monitorizar su rendimiento fisico y mantener habitos de vida saludables. Sin embargo, existe un vacio notable en el ecosistema ",
      "actual de aplicaciones deportivas: la mayoria de soluciones se centran en el individuo, ofreciendo seguimiento de pasos, ",
      "calorias quemadas o planes de entrenamiento personalizados, pero ignoran un aspecto fundamental del deporte: ",
      bold("su dimension social y comunitaria."),
    )),

    p(runs(
      "Organizar una quedada deportiva informal sigue siendo, paradojicamente, un proceso analogico y fragmentado. ",
      "Quien quiere jugar un partido de futbol 7, una sesion de padel o una ruta de senderismo con desconocidos debe recurrir ",
      "a grupos de WhatsApp, publicaciones en redes sociales o carteles en polideportivos locales. Este proceso presenta multiples ",
      "problemas: falta de visibilidad para nuevos jugadores, dificultad para encontrar personas con nivel similar, ",
      "ausencia de mecanismos de confianza y nula trazabilidad de la participacion.",
    )),

    p(runs(
      bold("MatchUp"), " nace como respuesta a esta necesidad real. Se trata de una plataforma web fullstack que permite a cualquier ",
      "persona crear, descubrir y participar en quedadas deportivas en su zona geografica. La aplicacion ofrece un sistema completo ",
      "que abarca desde el registro y la configuracion de preferencias deportivas hasta la gestion del ciclo de vida completo de una ",
      "quedada: creacion con ubicacion geolocalizada en mapa, busqueda con filtros avanzados (deporte, fecha, radio de proximidad), ",
      "inscripcion, finalizacion, confirmacion de asistencia por parte del organizador y valoracion entre participantes.",
    )),

    p(runs(
      "Uno de los pilares diferenciadores de MatchUp es su ", bold("sistema de fiabilidad. "),
      "Cada usuario cuenta con una puntuacion de fiabilidad (fiabilidad_score) que se recalcula automaticamente en funcion ",
      "de su historial de asistencia confirmada frente a ausencias. Este mecanismo incentiva el compromiso real y genera ",
      "un entorno de confianza entre los participantes, un aspecto que las alternativas existentes no abordan.",
    )),

    p(runs(
      "Tecnicamente, el proyecto se ha construido siguiendo las mejores practicas de la industria del desarrollo web moderno. ",
      "El backend esta implementado con ", bold("Spring Boot 3.3.5"), " sobre ", bold("Java 21"),
      ", exponiendo una API REST documentada con Swagger/OpenAPI. La persistencia se gestiona con ",
      bold("PostgreSQL 16"), " y migraciones versionadas mediante ", bold("Flyway"),
      ". La seguridad se implementa con ", bold("JWT"), " (access token + refresh token rotativo) y ",
      bold("BCrypt"), " para el hashing de contrasenas. El frontend se ha desarrollado con ",
      bold("Angular 19"), " utilizando standalone components, signals y Angular Material, integrando ",
      bold("Leaflet"), " y ", bold("OpenStreetMap"), " para la visualizacion de mapas interactivos. ",
      "El despliegue se automatiza completamente con ", bold("Docker Compose"), ", permitiendo arrancar ",
      "los tres servicios (base de datos, backend y frontend) con un unico comando.",
    )),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// 1.2 JUSTIFICACION
// ═══════════════════════════════════════════════════════════════════════════
function buildJustificacion() {
  return [
    h2("1.2 Justificacion del proyecto"),

    h3("1.2.1 Clasificacion del sector"),
    p(runs(
      "MatchUp se situa en la interseccion de tres sectores digitales en pleno crecimiento: las ", bold("aplicaciones de fitness y salud"),
      ", las ", bold("redes sociales deportivas"), " y las ", bold("plataformas de organizacion de eventos locales"),
      ". Segun datos del sector, el mercado global de aplicaciones de fitness alcanzo los 1.300 millones de usuarios en 2023, ",
      "con una tasa de crecimiento anual compuesto (CAGR) superior al 14%. Sin embargo, la inmensa mayoria de estas aplicaciones ",
      "(Strava, Nike Training Club, MyFitnessPal) se centran en el rendimiento individual, dejando desatendido el segmento ",
      "de deporte social y comunitario.",
    )),

    p(runs(
      "Plataformas como Meetup.com ofrecen organizacion de eventos genericos pero carecen de funcionalidades especificas ",
      "para el deporte: no hay filtrado por tipo de deporte, nivel de habilidad, proximidad geografica precisa ni sistema ",
      "de valoracion de participantes. Timpik, una de las pocas alternativas especializadas en Espana, ceso su actividad, ",
      "evidenciando tanto la demanda como la dificultad de encontrar un modelo sostenible en este nicho.",
    )),

    h3("1.2.2 Necesidades no cubiertas"),
    p(runs(
      "Tras analizar el panorama actual, se identifican las siguientes necesidades sin cubrir de forma satisfactoria:"
    )),
    p(runs(bold("Descubrimiento local: "), "No existe una plataforma consolidada que permita buscar quedadas deportivas cercanas ",
      "con filtros de distancia, deporte y disponibilidad horaria de forma sencilla e intuitiva.")),
    p(runs(bold("Confianza entre desconocidos: "), "Participar en actividades deportivas con personas desconocidas genera incertidumbre. ",
      "Ningun sistema actual ofrece un mecanismo de fiabilidad basado en el historial real de asistencia.")),
    p(runs(bold("Gestion integral del ciclo de vida: "), "Las herramientas existentes no cubren el flujo completo: creacion, inscripcion, ",
      "confirmacion de asistencia post-evento y valoracion mutua entre participantes.")),
    p(runs(bold("Nivel deportivo: "), "Los jugadores quieren encontrar companeros de nivel similar. Las plataformas actuales no ofrecen ",
      "autoevaluacion de nivel por deporte ni filtrado basado en este criterio.")),

    h3("1.2.3 Oportunidades de negocio"),
    p(runs(
      "Aunque el presente proyecto se desarrolla como trabajo academico sin animo de lucro, su arquitectura y funcionalidades ",
      "estan disenadas para soportar una evolucion comercial futura. Las principales vias de monetizacion incluyen: ",
      "un ", bold("modelo freemium"), " con funcionalidades premium (estadisticas avanzadas, quedadas privadas ilimitadas, insignias exclusivas); ",
      bold("publicidad local geosegmentada"), " (instalaciones deportivas, tiendas de material, nutricion); ",
      bold("acuerdos con polideportivos y centros deportivos"), " para la reserva integrada de pistas; ",
      "y ", bold("patrocinios de eventos"), " y ligas locales. El modelo se inspira en el exito de plataformas como ",
      "Strava (150 millones de usuarios, modelo freemium) adaptado al nicho de deporte social.",
    )),

    h3("1.2.4 Justificacion social"),
    p(runs(
      "El deporte es un vector de inclusion social reconocido por instituciones como la OMS y la UNESCO. ",
      "MatchUp contribuye a esta dimension facilitando que personas de cualquier edad, genero o condicion ",
      "puedan encontrar companeros para practicar deporte cerca de su ubicacion. La plataforma reduce las ",
      "barreras de entrada al deporte grupal: no es necesario pertenecer a un club, conocer a otros jugadores ",
      "previamente ni comprometerse con horarios fijos. Ademas, el sistema de fiabilidad fomenta la responsabilidad ",
      "individual y el respeto hacia el grupo.",
    )),

    h3("1.2.5 Justificacion tecnica"),
    p(runs(
      "El proyecto representa una oportunidad para aplicar de forma integrada las competencias adquiridas durante ",
      "el ciclo formativo de Desarrollo de Aplicaciones Web. La stack elegida (Spring Boot + Angular + PostgreSQL) ",
      "refleja las tecnologias mas demandadas en el mercado laboral actual para desarrollo web enterprise. ",
      "Adicionalmente, el proyecto aborda aspectos tecnicos avanzados como la autenticacion stateless con JWT y refresh ",
      "token rotativo, busquedas geoespaciales con la formula de Haversine, migraciones de base de datos versionadas, ",
      "gestion de errores estandarizada con RFC 7807 (Problem Details), testing con contenedores reales (Testcontainers) ",
      "y despliegue contenerizado con Docker. Todo el software utilizado es gratuito y de codigo abierto, ",
      "garantizando la accesibilidad economica y el cumplimiento del RGPD al no depender de servicios de terceros ",
      "que puedan transferir datos fuera de la UE.",
    )),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// 1.3 OBJETIVOS, FUNCIONES, RENDIMIENTOS
// ═══════════════════════════════════════════════════════════════════════════
function buildObjetivos() {
  const objRows = [
    ["OG-01", "Desarrollar una plataforma web funcional que permita a los usuarios crear, descubrir y participar en quedadas deportivas locales de forma intuitiva y segura."],
    ["OE-01", "Implementar un sistema de autenticacion y autorizacion robusto basado en JWT con refresh token rotativo y hashing BCrypt."],
    ["OE-02", "Desarrollar un modulo de busqueda geoespacial que permita localizar quedadas en un radio configurable mediante la formula de Haversine."],
    ["OE-03", "Construir un sistema de valoracion y fiabilidad que incentive el compromiso de los participantes mediante puntuacion automatica."],
    ["OE-04", "Disenar una interfaz de usuario responsive e intuitiva con mapa interactivo que facilite la visualizacion geografica de las quedadas."],
    ["OE-05", "Containerizar la aplicacion completa con Docker Compose para garantizar un despliegue reproducible en cualquier entorno."],
  ];

  const colW = [1200, 7826];

  return [
    h2("1.3 Objetivos, funciones y rendimientos"),

    h3("1.3.1 Objetivos"),
    p(runs("A continuacion se presentan el objetivo general y los objetivos especificos del proyecto, formulados de ",
      "forma medible y alcanzable dentro del plazo del trabajo de fin de grado.")),

    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: colW,
      rows: [
        new TableRow({ children: [headerCell("ID", colW[0]), headerCell("Descripcion del objetivo", colW[1])] }),
        ...objRows.map((row, i) => new TableRow({
          children: [
            dataCell(row[0], colW[0], { bold: true, align: AlignmentType.CENTER, shading: i % 2 === 0 ? "F8FAFC" : undefined }),
            dataCell(row[1], colW[1], { shading: i % 2 === 0 ? "F8FAFC" : undefined }),
          ]
        })),
      ],
    }),
    p(""),

    h3("1.3.2 Funcionalidades MVP"),
    p(runs("Las funcionalidades incluidas en el alcance del producto minimo viable (MVP) son las siguientes:")),

    p(runs(bold("Autenticacion y gestion de cuentas: "), "registro con email y contrasena, login, logout, refresh de tokens, recuperacion de contrasena mediante token temporal.")),
    p(runs(bold("Gestion de perfiles: "), "edicion de nombre, ubicacion y foto de perfil. Gestion de preferencias deportivas con nivel autoevaluado (1-5) y rol preferido por deporte.")),
    p(runs(bold("CRUD de quedadas: "), "creacion con deporte, fecha/hora, ubicacion en mapa (Leaflet + geocoding), capacidad y descripcion. Edicion y cancelacion por parte del organizador. Finalizacion con gestion de asistencia.")),
    p(runs(bold("Busqueda y filtrado: "), "listado paginado con filtros por deporte, rango de fechas, estado y radio de proximidad (Haversine). Vista dual: tarjetas y mapa interactivo con markers codificados por color segun estado.")),
    p(runs(bold("Participacion: "), "inscripcion y desinscripcion en quedadas. Control de aforo con transicion automatica ABIERTA/COMPLETA. Gestion de asistencia post-finalizacion (CONFIRMADO/AUSENTE) por el organizador.")),
    p(runs(bold("Valoraciones: "), "sistema de rating doble (nivel deportivo + deportividad, escala 1-5) entre participantes confirmados de quedadas finalizadas. Proteccion contra auto-valoracion y duplicados.")),
    p(runs(bold("Comentarios: "), "hilo de comentarios paginado por quedada, con creacion y eliminacion (autor o administrador).")),
    p(runs(bold("Sistema de fiabilidad: "), "calculo automatico de fiabilidad_score como porcentaje de asistencias confirmadas sobre el total de asistencias gestionadas.")),

    h3("1.3.3 Rendimientos deseados"),
    p(runs("Se establecen los siguientes requisitos de rendimiento para la plataforma:")),
    p(runs(bold("Tiempo de respuesta: "), "las operaciones CRUD deben responder en menos de 500 ms en condiciones normales de carga.")),
    p(runs(bold("Concurrencia: "), "el pool de conexiones HikariCP esta configurado para soportar hasta 5 conexiones simultaneas, adecuado para el entorno academico previsto.")),
    p(runs(bold("Disponibilidad: "), "la contenerizacion con Docker Compose permite reiniciar los servicios de forma independiente con healthchecks automaticos.")),
    p(runs(bold("Escalabilidad: "), "la arquitectura stateless con JWT permite escalar horizontalmente el backend sin compartir estado de sesion.")),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// 1.4 CICLO DE VIDA
// ═══════════════════════════════════════════════════════════════════════════
function buildCicloVida() {
  const fases = [
    ["C0", "Planificacion", "20-21 abr", "Definicion del stack, estructura de carpetas, requisitos iniciales, mockups de baja fidelidad.", "8"],
    ["C1", "Analisis y diseno", "22-23 abr", "Requisitos funcionales y no funcionales, casos de uso, diagrama de clases, mockups HTML detallados.", "10"],
    ["C2", "BD y entidades", "24-25 abr", "Esquema PostgreSQL, migraciones Flyway V1-V3, entidades JPA, repositorios, seed de deportes y usuarios.", "9"],
    ["C3", "Auth y seguridad", "26-27 abr", "JWT (access + refresh rotativo), BCrypt, SecurityConfig, filtro JWT, forgot/reset password, GlobalExceptionHandler.", "12"],
    ["C4", "Logica de negocio", "28-30 abr", "Servicios de quedadas, participacion, ratings, comentarios. Haversine, fiabilidad_score, reglas de negocio.", "14"],
    ["C5", "Frontend core", "01-03 may", "Angular 19 scaffold, auth flow, interceptors, guards, landing, login/register, layout principal.", "13"],
    ["C6", "Frontend avanzado", "04-06 may", "Listado con mapa Leaflet, filtros, detalle de quedada, perfil, formulario de creacion, valoraciones.", "15"],
    ["C7", "Testing y Docker", "07-09 may", "6 test unitarios Mockito, 1 integracion Testcontainers (14 pasos), Dockerfiles, docker-compose.yml, Postman (45+ requests).", "11"],
    ["C8", "Pulido y QA", "10-12 may", "Correccion de bugs, mejoras UX, responsive, validaciones, migacion V5, ajustes finales de estilos.", "8"],
    ["C9", "Documentacion", "13-19 may", "Memoria final, presentacion PowerPoint, script de defensa, preparacion de la defensa oral.", "12"],
  ];

  const colW = [600, 1600, 1400, 4226, 1200];

  return [
    h2("1.4 Ciclo de vida del proyecto"),

    p(runs(
      "El desarrollo de MatchUp ha seguido una ", bold("metodologia agil adaptada"),
      ", inspirada en Scrum pero ajustada a la realidad de un proyecto individual con plazo fijo de tres semanas. ",
      "En lugar de sprints formales, el trabajo se ha organizado en ", bold("10 fases o conversaciones (C0 a C9)"),
      ", cada una con un objetivo concreto y entregables definidos. Esta organizacion ha permitido mantener un ritmo ",
      "sostenible de trabajo, priorizar las funcionalidades MVP e iterar sobre el producto de forma incremental.",
    )),

    p(runs(
      "La eleccion de un enfoque agil frente a un modelo en cascada se justifica por la naturaleza exploratoria ",
      "del proyecto: los requisitos se han refinado iterativamente a medida que se profundizaba en la implementacion, ",
      "y las decisiones de diseno del frontend se han tomado tras validar la API del backend. Este enfoque ha resultado ",
      "especialmente util para gestionar la complejidad de un stack fullstack moderno en solitario.",
    )),

    p(runs(bold("Tabla 1."), " Fases del proyecto y dedicacion estimada.")),

    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: colW,
      rows: [
        new TableRow({ children: [
          headerCell("Fase", colW[0]),
          headerCell("Nombre", colW[1]),
          headerCell("Fechas", colW[2]),
          headerCell("Descripcion", colW[3]),
          headerCell("Horas", colW[4]),
        ]}),
        ...fases.map((f, i) => new TableRow({
          children: [
            dataCell(f[0], colW[0], { bold: true, align: AlignmentType.CENTER, shading: i % 2 === 0 ? "F8FAFC" : undefined }),
            dataCell(f[1], colW[1], { shading: i % 2 === 0 ? "F8FAFC" : undefined }),
            dataCell(f[2], colW[2], { align: AlignmentType.CENTER, shading: i % 2 === 0 ? "F8FAFC" : undefined }),
            dataCell(f[3], colW[3], { shading: i % 2 === 0 ? "F8FAFC" : undefined }),
            dataCell(f[4], colW[4], { align: AlignmentType.CENTER, shading: i % 2 === 0 ? "F8FAFC" : undefined }),
          ]
        })),
        new TableRow({ children: [
          dataCell("", colW[0], { shading: LIGHT_BG }),
          dataCell("", colW[1], { shading: LIGHT_BG }),
          dataCell("", colW[2], { shading: LIGHT_BG }),
          dataCell("TOTAL", colW[3], { bold: true, shading: LIGHT_BG, align: AlignmentType.RIGHT }),
          dataCell("112 h", colW[4], { bold: true, shading: LIGHT_BG, align: AlignmentType.CENTER }),
        ]}),
      ],
    }),
    p(""),

    ...figuraPlaceholder(1, "Diagrama de Gantt del proyecto (C0-C9, abril-mayo 2026)."),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// 1.5 RECURSOS
// ═══════════════════════════════════════════════════════════════════════════
function buildRecursos() {
  const sw = [
    ["Java 21 (OpenJDK)", "Lenguaje de programacion del backend", "Gratuito"],
    ["Spring Boot 3.3.5", "Framework backend (web, security, data JPA, validation, mail)", "Gratuito"],
    ["PostgreSQL 16", "Sistema gestor de base de datos relacional", "Gratuito"],
    ["Flyway 10", "Herramienta de migraciones de base de datos", "Gratuito"],
    ["Hibernate 6 / JPA", "ORM para la capa de persistencia", "Gratuito"],
    ["jjwt 0.12.6", "Libreria para generacion y validacion de JWT", "Gratuito"],
    ["MapStruct 1.5.5", "Generador de mappers DTO-Entity en compilacion", "Gratuito"],
    ["Lombok 1.18.34", "Reductor de boilerplate Java (getters, builders, etc.)", "Gratuito"],
    ["Springdoc OpenAPI 2.6", "Generacion de documentacion Swagger UI", "Gratuito"],
    ["Angular 19", "Framework frontend SPA (standalone components, signals)", "Gratuito"],
    ["Angular Material 19", "Libreria de componentes UI Material Design", "Gratuito"],
    ["Leaflet 1.9.4", "Libreria de mapas interactivos JavaScript", "Gratuito"],
    ["Tailwind CSS 3.4", "Framework CSS utility-first", "Gratuito"],
    ["RxJS 7.8", "Programacion reactiva para interceptors y servicios", "Gratuito"],
    ["Docker / Docker Compose", "Contenerizacion y orquestacion de servicios", "Gratuito"],
    ["Testcontainers 1.19.8", "Contenedores efimeros para tests de integracion", "Gratuito"],
    ["JUnit 5 + Mockito", "Frameworks de testing unitario e integracion", "Gratuito"],
    ["Postman", "Testing manual de API (45+ requests)", "Gratuito"],
    ["Git + GitHub", "Control de versiones y repositorio remoto", "Gratuito"],
    ["IntelliJ IDEA", "IDE para desarrollo backend Java", "Gratuito (Community)"],
    ["Visual Studio Code", "Editor para desarrollo frontend Angular", "Gratuito"],
    ["Node.js 20+", "Runtime JavaScript para Angular CLI y herramientas de build", "Gratuito"],
    ["Maven", "Gestor de dependencias y build del backend", "Gratuito"],
  ];

  const colW = [2800, 4426, 1800];

  return [
    h2("1.5 Recursos"),

    h3("1.5.1 Recursos humanos"),
    p(runs(
      "El proyecto ha sido desarrollado integramente por ", bold("Alvaro Sanchez Rodriguez"),
      " como trabajo individual del ciclo formativo. La tutorizacion academica ha sido realizada por ",
      bold("Vladimir Rico Hebles"), ", profesor del departamento de informatica del IES Los Alcores. ",
      "No se han empleado beta-testers externos; las pruebas funcionales se han realizado por el propio autor ",
      "durante las fases de desarrollo y pulido.",
    )),

    h3("1.5.2 Recursos hardware"),
    p(runs(
      "El desarrollo se ha llevado a cabo en un unico equipo con las siguientes especificaciones:"
    )),
    p(runs(bold("Procesador: "), "AMD Ryzen 5")),
    p(runs(bold("Memoria RAM: "), "16 GB")),
    p(runs(bold("Sistema operativo: "), "Windows 11")),
    p(runs(bold("Almacenamiento: "), "SSD (suficiente para compilacion rapida y ejecucion de contenedores Docker)")),
    p(runs(
      "El equipo ha resultado adecuado para ejecutar simultaneamente el servidor PostgreSQL, el backend Spring Boot, ",
      "el servidor de desarrollo Angular y Docker Desktop sin problemas de rendimiento apreciables.",
    )),

    h3("1.5.3 Recursos software"),
    p(runs("La totalidad del software empleado en el desarrollo de MatchUp es ", bold("gratuito y de codigo abierto"),
      " (o dispone de versiones gratuitas suficientes), lo que garantiza un coste de licencias igual a cero ",
      "y la reproducibilidad del entorno de desarrollo por parte de cualquier evaluador.")),

    p(runs(bold("Tabla 2."), " Stack tecnologico completo del proyecto.")),

    new Table({
      width: { size: CONTENT_W, type: WidthType.DXA },
      columnWidths: colW,
      rows: [
        new TableRow({ children: [
          headerCell("Tecnologia", colW[0]),
          headerCell("Funcion en el proyecto", colW[1]),
          headerCell("Coste", colW[2]),
        ]}),
        ...sw.map((row, i) => new TableRow({
          children: [
            dataCell(row[0], colW[0], { bold: true, shading: i % 2 === 0 ? "F8FAFC" : undefined }),
            dataCell(row[1], colW[1], { shading: i % 2 === 0 ? "F8FAFC" : undefined }),
            dataCell(row[2], colW[2], { align: AlignmentType.CENTER, color: "16A34A", shading: i % 2 === 0 ? "F8FAFC" : undefined }),
          ]
        })),
      ],
    }),
    p(""),

    h3("1.5.4 Presupuesto estimado"),
    p(runs(
      "El coste total del proyecto en terminos de licencias y servicios es de ", bold("0,00 euros"),
      ". Todas las herramientas utilizadas son gratuitas o disponen de planes gratuitos suficientes para el alcance del proyecto. ",
      "El despliegue en produccion se realizara en el servidor del centro educativo mediante Docker, sin coste de hosting. ",
      "En un escenario comercial futuro, los costes se limitirian a hosting cloud (estimado en 20-50 euros/mes para un VPS basico) ",
      "y un dominio (aproximadamente 12 euros/ano).",
    )),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// GENERAR DOCUMENTO
// ═══════════════════════════════════════════════════════════════════════════
async function main() {
  const doc = new Document({
    creator: "Alvaro Sanchez Rodriguez",
    title: "MatchUp - Memoria TFG DAW",
    description: "Trabajo Fin de Grado - Plataforma web de quedadas deportivas",
    styles: {
      default: {
        document: { run: { font: "Arial", size: 24 } },
      },
      paragraphStyles: [
        {
          id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 36, bold: true, font: "Arial", color: BLUE_DARK },
          paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0 },
        },
        {
          id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 30, bold: true, font: "Arial", color: BLUE_DARK },
          paragraph: { spacing: { before: 240, after: 200 }, outlineLevel: 1 },
        },
        {
          id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 26, bold: true, font: "Arial", color: BLUE_MID },
          paragraph: { spacing: { before: 200, after: 160 }, outlineLevel: 2 },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [{
            level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          }],
        },
      ],
    },
    sections: [
      // ── Seccion 1: Portada (sin header/footer) ──
      {
        properties: {
          page: {
            size: { width: PAGE_W, height: PAGE_H },
            margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
          },
        },
        children: buildPortada(),
      },
      // ── Seccion 2: TOC ──
      {
        properties: {
          page: {
            size: { width: PAGE_W, height: PAGE_H },
            margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
          },
        },
        headers: {
          default: new Header({
            children: [new Paragraph({
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BLUE_MID, space: 4 } },
              spacing: { after: 0 },
              children: [
                new TextRun({ text: "MatchUp", font: "Arial", size: 18, bold: true, color: BLUE_MID }),
                new TextRun({ text: "  |  Memoria TFG  |  Alvaro Sanchez Rodriguez", font: "Arial", size: 16, color: GRAY }),
              ],
            })],
          }),
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              border: { top: { style: BorderStyle.SINGLE, size: 2, color: "E5E7EB", space: 4 } },
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Pagina ", font: "Arial", size: 18, color: GRAY }),
                new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: GRAY }),
              ],
            })],
          }),
        },
        children: buildTOC(),
      },
      // ── Seccion 3: Contenido del Cap. 1 ──
      {
        properties: {
          page: {
            size: { width: PAGE_W, height: PAGE_H },
            margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
          },
        },
        headers: {
          default: new Header({
            children: [new Paragraph({
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BLUE_MID, space: 4 } },
              spacing: { after: 0 },
              children: [
                new TextRun({ text: "MatchUp", font: "Arial", size: 18, bold: true, color: BLUE_MID }),
                new TextRun({ text: "  |  Memoria TFG  |  Alvaro Sanchez Rodriguez", font: "Arial", size: 16, color: GRAY }),
              ],
            })],
          }),
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              border: { top: { style: BorderStyle.SINGLE, size: 2, color: "E5E7EB", space: 4 } },
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Pagina ", font: "Arial", size: 18, color: GRAY }),
                new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: GRAY }),
              ],
            })],
          }),
        },
        children: [
          ...buildIntroduccion(),
          ...buildJustificacion(),
          ...buildObjetivos(),
          ...buildCicloVida(),
          ...buildRecursos(),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, "..", "memoria-MatchUp.docx");
  fs.writeFileSync(outPath, buffer);
  console.log("Memoria generada en: " + outPath);
  console.log("Tamano: " + (buffer.length / 1024).toFixed(1) + " KB");
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
