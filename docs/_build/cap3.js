/**
 * cap3.js — Capitulo 3: Conclusiones
 */
const S = require("./shared");

function buildConclusiones() {
  // ── 3.1 Cumplimiento de objetivos ──
  const objCumplimiento = [
    ["OG-01", "Desarrollar una plataforma web funcional para crear, descubrir y participar en quedadas deportivas.", "Cumplido", "La plataforma permite el ciclo completo: registro, creacion de quedadas con geolocalizacion, busqueda con filtros avanzados, inscripcion, finalizacion y valoracion."],
    ["OE-01", "Sistema de autenticacion JWT con refresh token rotativo y BCrypt.", "Cumplido", "Implementado con access token (15 min), refresh rotativo (7 dias), logout con revocacion y recuperacion de contrasena con token temporal."],
    ["OE-02", "Busqueda geoespacial con formula de Haversine.", "Cumplido", "Implementada en QuedadaSpecification mediante JPA Criteria API, permitiendo filtrar quedadas por radio en kilometros desde la ubicacion del usuario."],
    ["OE-03", "Sistema de valoracion y fiabilidad automatica.", "Cumplido", "Rating doble (nivel + deportividad) entre participantes confirmados. Fiabilidad_score recalculado automaticamente tras cada gestion de asistencia."],
    ["OE-04", "Interfaz responsive con mapa interactivo.", "Cumplido", "Frontend Angular 19 con Angular Material, mapa Leaflet/OpenStreetMap con markers codificados por color segun estado de la quedada."],
    ["OE-05", "Contenerizacion con Docker Compose.", "Cumplido", "Tres servicios (PostgreSQL, backend Spring Boot, frontend nginx) orquestados con healthchecks y volumen persistente para la base de datos."],
  ];

  const colObj = [800, 3200, 1000, 4026];

  // ── 3.2 Desviaciones ──
  const desviaciones = [
    ["C0-C1", "Planificacion y analisis", "18 h", "16 h", "Se partia de una vision clara del producto, lo que acelero la toma de decisiones iniciales."],
    ["C2", "BD y entidades", "9 h", "10 h", "El mapeo de ENUMs PostgreSQL con Hibernate requirio investigacion adicional (@JdbcTypeCode)."],
    ["C3", "Auth y seguridad", "12 h", "14 h", "La implementacion del refresh token rotativo y la prevencion de race conditions con BehaviorSubject demando mas tiempo del previsto."],
    ["C4", "Logica de negocio", "14 h", "13 h", "Los servicios siguieron un patron uniforme (Controller-Service-Repository) que facilito la implementacion."],
    ["C5-C6", "Frontend", "28 h", "30 h", "La integracion de Leaflet con Angular 19 standalone components y la gestion del geocoding requirieron ajustes adicionales."],
    ["C7", "Testing y Docker", "11 h", "12 h", "La configuracion de Testcontainers con PostgreSQL y el Dockerfile multi-stage requirieron iteraciones."],
    ["C8", "Pulido y QA", "8 h", "7 h", "La fase de correccion resulto mas agil gracias a la buena cobertura de tests y la modularidad del codigo."],
    ["C9", "Documentacion", "12 h", "12 h", "Ajustado al plan previsto."],
  ];

  const colDesv = [800, 2200, 1000, 1000, 4026];

  return [
    S.h1("3. Conclusiones"),

    // ═══════════════════════════════════════════════════════════════════
    // 3.1 CUMPLIMIENTO DE OBJETIVOS
    // ═══════════════════════════════════════════════════════════════════
    S.h2("3.1 Cumplimiento de objetivos"),

    S.p(S.runs(
      "A continuacion se evalua el grado de cumplimiento de cada uno de los objetivos definidos en el apartado 1.3. ",
      "Todos los objetivos planteados inicialmente han sido alcanzados de forma satisfactoria dentro del plazo establecido.",
    )),

    S.p(S.runs(S.bold("Tabla 6."), " Evaluacion del cumplimiento de objetivos.")),

    S.makeTable(colObj, ["ID", "Objetivo", "Estado", "Evidencia"], objCumplimiento.map(r => [
      { text: r[0], bold: true, align: S.AlignmentType.CENTER },
      r[1],
      { text: r[2], bold: true, color: S.GREEN, align: S.AlignmentType.CENTER },
      r[3],
    ])),
    S.p(""),

    S.p(S.runs(
      "El cumplimiento integro de los objetivos demuestra que la planificacion inicial fue realista y que la metodologia ",
      "agil adaptada permitio mantener el foco en las funcionalidades esenciales del MVP sin perder de vista la calidad tecnica.",
    )),

    // ═══════════════════════════════════════════════════════════════════
    // 3.2 DESVIACIONES RESPECTO A LA PLANIFICACION
    // ═══════════════════════════════════════════════════════════════════
    S.h2("3.2 Desviaciones respecto a la planificacion"),

    S.p(S.runs(
      "Toda planificacion de software esta sujeta a desviaciones. En este apartado se comparan las horas estimadas en el ",
      "apartado 1.4 con las horas reales invertidas, analizando las causas de las diferencias mas significativas.",
    )),

    S.p(S.runs(S.bold("Tabla 7."), " Comparativa de horas estimadas frente a horas reales por fase.")),

    S.makeTable(colDesv, ["Fase", "Nombre", "Estimado", "Real", "Comentario"], desviaciones.map(r => [
      { text: r[0], bold: true, align: S.AlignmentType.CENTER },
      r[1],
      { text: r[2], align: S.AlignmentType.CENTER },
      { text: r[3], align: S.AlignmentType.CENTER },
      r[4],
    ])),
    S.p(""),

    S.p(S.runs(
      S.bold("Total estimado: 112 horas. Total real: 114 horas. "),
      "La desviacion global es de apenas un 1,8%, lo que se considera despreciable en un proyecto de desarrollo de software. ",
      "Las principales desviaciones positivas (mas tiempo del previsto) se concentraron en las fases de autenticacion y frontend, ",
      "ambas relacionadas con la complejidad de integrar tecnologias avanzadas (JWT rotativo, Leaflet con Angular). ",
      "Estas desviaciones fueron compensadas por fases que resultaron mas agiles de lo previsto (planificacion, logica de negocio y pulido).",
    )),

    // ═══════════════════════════════════════════════════════════════════
    // 3.3 LECCIONES APRENDIDAS
    // ═══════════════════════════════════════════════════════════════════
    S.h2("3.3 Lecciones aprendidas"),

    S.p(S.runs(
      "El desarrollo de MatchUp ha supuesto un proceso de aprendizaje intensivo que trasciende los conocimientos ",
      "adquiridos en las asignaturas del ciclo formativo. A continuacion se recogen las principales lecciones aprendidas ",
      "durante el proceso de desarrollo.",
    )),

    S.h3("3.3.1 Arquitectura y diseno"),
    S.p(S.runs(
      S.bold("La arquitectura por features mejora drasticamente la mantenibilidad. "),
      "Organizar el backend en paquetes por dominio (user, meetup, participation, rating, comment, sport, auth) en lugar de ",
      "por capas tecnicas (controllers, services, repositories) ha facilitado enormemente la navegacion del codigo, la localizacion ",
      "de errores y la adicion de nuevas funcionalidades. Cada feature es autocontenida y su impacto en el resto del sistema es minimo.",
    )),
    S.p(S.runs(
      S.bold("MapStruct reduce errores en el mapeo DTO-Entity. "),
      "La generacion automatica de mappers en tiempo de compilacion elimina la posibilidad de olvidar campos o introducir ",
      "errores manuales en las conversiones, un problema frecuente cuando se utiliza mapeo manual con constructores o builders.",
    )),

    S.h3("3.3.2 Seguridad"),
    S.p(S.runs(
      S.bold("El refresh token rotativo anade complejidad significativa. "),
      "Implementar correctamente la rotacion de refresh tokens, incluyendo la revocacion del token anterior y la gestion ",
      "de peticiones concurrentes con el patron BehaviorSubject en el interceptor de Angular, ha sido una de las partes mas ",
      "desafiantes del proyecto. Sin embargo, el resultado es un sistema de autenticacion robusto que cumple con las mejores ",
      "practicas de seguridad (OWASP).",
    )),
    S.p(S.runs(
      S.bold("GlobalExceptionHandler con ProblemDetail estandariza las respuestas de error. "),
      "Adoptar el formato RFC 7807 desde el inicio del proyecto ha simplificado el manejo de errores en el frontend, ",
      "ya que todas las respuestas de error siguen una estructura predecible con type, title, status y detail.",
    )),

    S.h3("3.3.3 Frontend y UX"),
    S.p(S.runs(
      S.bold("Angular 19 con standalone components simplifica la arquitectura. "),
      "La eliminacion de NgModules y el uso de standalone components con lazy loading ha resultado en un proyecto frontend ",
      "mas ligero y facil de mantener. Los signals, aunque todavia en fase de adopcion en el ecosistema Angular, ofrecen ",
      "una reactividad mas intuitiva que los Observables de RxJS para el estado local de componentes.",
    )),
    S.p(S.runs(
      S.bold("Leaflet requiere adaptacion para funcionar correctamente con Angular. "),
      "La gestion del ciclo de vida del mapa (inicializacion, destruccion, invalidacion de tamano) y la carga correcta ",
      "de los iconos de los markers han requerido soluciones especificas que no estan documentadas en la libreria oficial.",
    )),

    S.h3("3.3.4 Testing y despliegue"),
    S.p(S.runs(
      S.bold("Testcontainers proporciona tests de integracion realistas. "),
      "Ejecutar los tests de integracion contra un contenedor PostgreSQL real (en lugar de H2 en memoria) ha permitido ",
      "detectar problemas especificos de PostgreSQL (ENUMs nativos, funciones trigonometricas para Haversine) que habrian ",
      "pasado desapercibidos con una base de datos en memoria.",
    )),
    S.p(S.runs(
      S.bold("Docker multi-stage reduce drasticamente el tamano de las imagenes. "),
      "La separacion de las fases de build y runtime en los Dockerfiles ha permitido obtener imagenes de produccion ligeras ",
      "(basadas en Alpine) que no incluyen herramientas de compilacion innecesarias.",
    )),

    // ═══════════════════════════════════════════════════════════════════
    // 3.4 MEJORAS FUTURAS
    // ═══════════════════════════════════════════════════════════════════
    S.h2("3.4 Mejoras futuras"),

    S.p(S.runs(
      "Aunque el MVP cumple todos los objetivos planteados, se identifican diversas lineas de mejora que podrian ",
      "implementarse en versiones futuras de la plataforma para aumentar su valor y alcance.",
    )),

    S.h3("3.4.1 Funcionalidades"),
    S.p(S.runs(
      S.bold("Notificaciones en tiempo real: "), "implementar WebSocket (Spring WebSocket + SockJS) para notificar a los usuarios ",
      "en tiempo real cuando alguien se une a su quedada, cuando se publica un comentario o cuando una quedada cercana esta a punto ",
      "de completar su aforo. Actualmente el usuario debe refrescar la pagina para ver cambios.",
    )),
    S.p(S.runs(
      S.bold("Chat integrado por quedada: "), "anadir un sistema de mensajeria en tiempo real asociado a cada quedada, ",
      "permitiendo a los participantes coordinarse (punto de encuentro exacto, material necesario, cambios de ultima hora) ",
      "sin salir de la plataforma.",
    )),
    S.p(S.runs(
      S.bold("Sistema de logros e insignias (gamificacion): "), "recompensar a los usuarios activos con insignias ",
      "por hitos alcanzados (primera quedada, 10 quedadas organizadas, 50 asistencias confirmadas, valoracion media superior a 4.5). ",
      "Este sistema aumentaria la retencion y el engagement de los usuarios.",
    )),
    S.p(S.runs(
      S.bold("Quedadas recurrentes: "), "permitir a los organizadores crear quedadas que se repiten semanalmente ",
      "(por ejemplo, futbol todos los martes a las 20:00), evitando la creacion manual repetitiva.",
    )),
    S.p(S.runs(
      S.bold("Integracion con calendario: "), "exportar quedadas a Google Calendar o iCal mediante enlaces .ics, ",
      "facilitando que los usuarios recuerden sus compromisos deportivos.",
    )),

    S.h3("3.4.2 Tecnicas"),
    S.p(S.runs(
      S.bold("Migracion a PostGIS: "), "sustituir la formula de Haversine implementada manualmente por la extension ",
      "geoespacial PostGIS de PostgreSQL, que ofrece funciones ST_DWithin y ST_Distance optimizadas con indices GiST. ",
      "Esto mejoraria significativamente el rendimiento de las busquedas por proximidad a gran escala.",
    )),
    S.p(S.runs(
      S.bold("Cache con Redis: "), "introducir una capa de cache para las consultas mas frecuentes (listado de deportes, ",
      "quedadas cercanas populares, perfil publico de usuarios) y para la gestion de refresh tokens, reduciendo la carga ",
      "sobre PostgreSQL.",
    )),
    S.p(S.runs(
      S.bold("CI/CD con GitHub Actions: "), "automatizar la ejecucion de tests, el analisis estatico de codigo (SonarQube) ",
      "y el despliegue a un entorno de staging/produccion con cada push a la rama principal.",
    )),
    S.p(S.runs(
      S.bold("Subida de imagenes: "), "actualmente las fotos de perfil se gestionan mediante URL externa. Una mejora seria ",
      "implementar subida directa de imagenes con almacenamiento en un servicio compatible con S3 (MinIO para self-hosting) ",
      "y redimensionado automatico con thumbnails.",
    )),

    S.h3("3.4.3 Experiencia de usuario"),
    S.p(S.runs(
      S.bold("Aplicacion movil nativa o PWA: "), "convertir el frontend en una Progressive Web App (PWA) con soporte offline ",
      "y notificaciones push, o desarrollar aplicaciones nativas con Ionic o React Native para mejorar la experiencia en ",
      "dispositivos moviles, donde se concentra la mayoria del uso.",
    )),
    S.p(S.runs(
      S.bold("Internacionalizacion (i18n): "), "preparar la plataforma para soportar multiples idiomas, empezando por ",
      "ingles y espanol, utilizando Angular i18n o ngx-translate. Esto ampliaria el mercado potencial de la aplicacion.",
    )),
    S.p(S.runs(
      S.bold("Accesibilidad (WCAG 2.1): "), "realizar una auditoria de accesibilidad y garantizar que todos los componentes ",
      "cumplen el nivel AA de las WCAG 2.1, incluyendo navegacion por teclado, lectores de pantalla y contraste adecuado.",
    )),

    // ═══════════════════════════════════════════════════════════════════
    // 3.5 VALORACION PERSONAL
    // ═══════════════════════════════════════════════════════════════════
    S.h2("3.5 Valoracion personal"),

    S.p(S.runs(
      "El desarrollo de MatchUp ha sido, sin duda, el proyecto mas ambicioso y formativo de mi trayectoria academica. ",
      "Construir una aplicacion fullstack completa desde cero, abarcando desde el diseno de la base de datos hasta el ",
      "despliegue contenerizado, me ha obligado a integrar conocimientos de todas las asignaturas del ciclo formativo ",
      "y a enfrentarme a problemas reales que no se cubren en el aula.",
    )),

    S.p(S.runs(
      "La decision de utilizar una stack moderna y ampliamente demandada en la industria (Spring Boot + Angular + PostgreSQL + Docker) ",
      "ha supuesto un reto adicional, ya que algunas de estas tecnologias (especialmente Angular 19 con standalone components y ",
      "Spring Security con JWT) van mas alla del temario del ciclo. Sin embargo, considero que esta eleccion ha enriquecido ",
      "enormemente mi formacion y me ha preparado mejor para el mercado laboral.",
    )),

    S.p(S.runs(
      "El aspecto que mas satisfaccion personal me ha producido es ver como una idea inicial se materializa en una ",
      "aplicacion funcional, con usuarios de prueba, datos reales en mapa y un sistema de fiabilidad que incentiva ",
      "el compromiso. MatchUp no es solo un ejercicio academico: es una herramienta que resuelve una necesidad real ",
      "y que, con las mejoras futuras identificadas, podria convertirse en un producto viable.",
    )),

    S.p(S.runs(
      "En definitiva, este Trabajo de Fin de Grado ha cumplido con creces su objetivo formativo: me ha permitido ",
      "aplicar las competencias del titulo de Tecnico Superior en Desarrollo de Aplicaciones Web en un proyecto ",
      "realista, completo y tecnicamnete riguroso, sentando las bases para mi desarrollo profesional futuro.",
    )),
  ];
}

module.exports = { buildConclusiones };
