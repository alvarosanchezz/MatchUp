/**
 * cap4.js — Capitulo 4: Bibliografia y Anexos
 */
const S = require("./shared");

function buildBibliografia() {
  const refs = [
    "Bloch, J. (2018). Effective Java (3.ª ed.). Addison-Wesley.",
    "Walls, C. (2022). Spring in Action (6.ª ed.). Manning Publications.",
    "Pivotal Software. (2024). Spring Boot Reference Documentation (v3.3.x). https://docs.spring.io/spring-boot/docs/3.3.x/reference/html/",
    "Pivotal Software. (2024). Spring Security Reference (v6.3.x). https://docs.spring.io/spring-security/reference/",
    "The PostgreSQL Global Development Group. (2024). PostgreSQL 16 Documentation. https://www.postgresql.org/docs/16/",
    "Red Hat. (2024). Flyway Documentation. https://documentation.red-gate.com/fd",
    "Red Hat. (2024). Hibernate ORM 6.4 User Guide. https://docs.jboss.org/hibernate/orm/6.4/userguide/html_single/Hibernate_User_Guide.html",
    "Jones, M., Bradley, J. y Sakimura, N. (2015). JSON Web Token (JWT) (RFC 7519). IETF. https://datatracker.ietf.org/doc/html/rfc7519",
    "Nottingham, M. y Wilde, E. (2016). Problem Details for HTTP APIs (RFC 7807). IETF. https://datatracker.ietf.org/doc/html/rfc7807",
    "Google. (2024). Angular Documentation (v19). https://angular.dev/",
    "Google. (2024). Angular Material Component Dev Kit. https://material.angular.io/",
    "Agafonkin, V. (2024). Leaflet — an open-source JavaScript library for interactive maps. https://leafletjs.com/",
    "OpenStreetMap Foundation. (2024). OpenStreetMap Wiki. https://wiki.openstreetmap.org/",
    "Nominatim Contributors. (2024). Nominatim Documentation. https://nominatim.org/release-docs/develop/",
    "Tailwind Labs. (2024). Tailwind CSS Documentation (v3.4). https://tailwindcss.com/docs",
    "Docker Inc. (2024). Docker Documentation. https://docs.docker.com/",
    "Docker Inc. (2024). Docker Compose Overview. https://docs.docker.com/compose/",
    "Testcontainers Contributors. (2024). Testcontainers for Java. https://java.testcontainers.org/",
    "Postman Inc. (2024). Postman Learning Center. https://learning.postman.com/",
    "Sinyagin, D. (2024). jjwt — Java JWT: JSON Web Token for Java and Android (v0.12.6). https://github.com/jwtk/jjwt",
    "MapStruct Contributors. (2024). MapStruct Reference Guide (v1.5.5). https://mapstruct.org/documentation/stable/reference/html/",
    "Project Lombok Contributors. (2024). Project Lombok (v1.18.34). https://projectlombok.org/",
    "Springdoc Contributors. (2024). Springdoc OpenAPI (v2.6.0). https://springdoc.org/",
    "OWASP Foundation. (2021). OWASP Top Ten Web Application Security Risks. https://owasp.org/www-project-top-ten/",
    "Fielding, R. T. (2000). Architectural Styles and the Design of Network-based Software Architectures (Tesis doctoral). University of California, Irvine.",
    "Gamma, E., Helm, R., Johnson, R. y Vlissides, J. (1994). Design Patterns: Elements of Reusable Object-Oriented Software. Addison-Wesley.",
  ];

  return [
    S.h1("4. Bibliografia"),

    S.p(S.runs(
      "A continuacion se recogen las referencias bibliograficas y recursos tecnicos consultados durante el desarrollo ",
      "del proyecto, organizados en formato APA (7.ª edicion). Se incluyen tanto obras academicas como documentacion ",
      "oficial de las tecnologias empleadas.",
    )),

    ...refs.map((ref, i) => S.p(S.runs(
      { text: `[${i + 1}] `, bold: true, size: 22 },
      { text: ref, size: 22 },
    ), { indent: { left: 480, hanging: 480 }, after: 120 })),
  ];
}

function buildAnexos() {
  // ── Anexo A: Estructura del proyecto ──
  const estructura = [
    "matchup/",
    "  backend/",
    "    src/main/java/com/matchup/",
    "      auth/          (controller, service, dto, entity)",
    "      user/          (controller, service, dto, entity, mapper, repository)",
    "      meetup/        (controller, service, dto, entity, mapper, repository)",
    "      participation/ (controller, service, dto, entity, mapper, repository)",
    "      rating/        (controller, service, dto, entity, mapper, repository)",
    "      comment/       (controller, service, dto, entity, mapper, repository)",
    "      sport/         (controller, service, dto, entity, mapper, repository)",
    "      config/        (SecurityConfig, CorsConfig, OpenApiConfig)",
    "      security/      (JwtService, JwtAuthFilter)",
    "      common/        (exception/GlobalExceptionHandler)",
    "    src/main/resources/",
    "      db/migration/  (V1 a V5)",
    "      application.yml, application-dev.yml, application-prod.yml",
    "    src/test/java/com/matchup/",
    "      unit/          (6 tests Mockito)",
    "      integration/   (FullFlowIntegrationTest - Testcontainers)",
    "    pom.xml, Dockerfile",
    "  frontend/",
    "    src/app/",
    "      core/          (interceptors, guards, services, models)",
    "      features/      (landing, auth, meetups, profile, layout)",
    "      shared/        (components reutilizables)",
    "    angular.json, package.json, tailwind.config.js, Dockerfile",
    "  docker-compose.yml",
    "  docs/",
    "    memoria-MatchUp.docx",
    "    presentacion-MatchUp.pptx",
    "    script-defensa.md",
    "    mockup_01_login.html ... mockup_06_perfil.html",
  ];

  // ── Anexo B: Endpoints API ──
  const endpoints = [
    ["POST", "/auth/register", "Registro de nuevo usuario", "Publico"],
    ["POST", "/auth/login", "Inicio de sesion (devuelve JWT)", "Publico"],
    ["POST", "/auth/refresh", "Renovacion de access token", "Publico"],
    ["POST", "/auth/logout", "Revocacion de refresh token", "Autenticado"],
    ["POST", "/auth/forgot-password", "Solicitud de reset de contrasena", "Publico"],
    ["POST", "/auth/reset-password", "Restablecimiento de contrasena", "Publico"],
    ["GET", "/api/users/me", "Perfil del usuario autenticado", "Autenticado"],
    ["PATCH", "/api/users/me", "Edicion del perfil propio", "Autenticado"],
    ["GET", "/api/users/{id}", "Perfil publico de un usuario", "Autenticado"],
    ["GET", "/api/users/me/sports", "Deportes favoritos del usuario", "Autenticado"],
    ["PUT", "/api/users/me/sports", "Actualizar preferencias deportivas", "Autenticado"],
    ["GET", "/api/users/me/meetups", "Quedadas del usuario (filtro tipo)", "Autenticado"],
    ["GET", "/api/quedadas", "Listado paginado con filtros", "Autenticado"],
    ["POST", "/api/quedadas", "Crear nueva quedada", "Autenticado"],
    ["GET", "/api/quedadas/{id}", "Detalle de una quedada", "Autenticado"],
    ["PATCH", "/api/quedadas/{id}", "Editar quedada (organizador)", "Autenticado"],
    ["DELETE", "/api/quedadas/{id}", "Cancelar quedada (organizador)", "Autenticado"],
    ["POST", "/api/quedadas/{id}/finalizar", "Finalizar quedada", "Autenticado"],
    ["POST", "/api/quedadas/{id}/join", "Inscribirse en quedada", "Autenticado"],
    ["DELETE", "/api/quedadas/{id}/leave", "Desapuntarse de quedada", "Autenticado"],
    ["POST", "/api/quedadas/{id}/participantes/{uid}/confirmar", "Confirmar asistencia", "Autenticado"],
    ["POST", "/api/quedadas/{id}/participantes/{uid}/ausente", "Marcar ausente", "Autenticado"],
    ["GET", "/api/quedadas/{id}/ratings", "Valoraciones de una quedada", "Autenticado"],
    ["POST", "/api/quedadas/{id}/ratings", "Crear valoracion", "Autenticado"],
    ["GET", "/api/quedadas/{id}/comentarios", "Comentarios de una quedada", "Autenticado"],
    ["POST", "/api/quedadas/{id}/comentarios", "Publicar comentario", "Autenticado"],
    ["DELETE", "/api/comentarios/{id}", "Eliminar comentario", "Autenticado"],
    ["GET", "/api/deportes", "Listado de deportes", "Autenticado"],
    ["POST", "/api/deportes", "Crear deporte", "ADMIN"],
    ["PUT", "/api/deportes/{id}", "Editar deporte", "ADMIN"],
    ["DELETE", "/api/deportes/{id}", "Eliminar deporte", "ADMIN"],
  ];

  const colEnd = [700, 3200, 3326, 1800];

  // ── Anexo C: Usuarios de prueba ──
  const testUsers = [
    ["ana_garcia", "matchup123", "USUARIO", "Sevilla", "100%"],
    ["carlos_perez", "carlos456", "USUARIO", "Dos Hermanas", "100%"],
    ["laura_martin", "laura789", "USUARIO", "Alcala de Guadaira", "100%"],
    ["admin_matchup", "admin2024", "ADMIN", "Sevilla", "100%"],
    ["pedro_lopez", "pedro321", "USUARIO", "Mairena del Alcor", "100%"],
  ];

  const colUsers = [1800, 1800, 1200, 2426, 1800];

  return [
    S.h1("Anexos"),

    // ── ANEXO A ──
    S.h2("Anexo A. Estructura del proyecto"),
    S.p(S.runs(
      "A continuacion se muestra la estructura de directorios principal del proyecto MatchUp, ",
      "organizada por features tanto en el backend como en el frontend.",
    )),
    S.codeBlock(estructura),

    // ── ANEXO B ──
    S.h2("Anexo B. Endpoints de la API REST"),
    S.p(S.runs(
      "La siguiente tabla recoge todos los endpoints expuestos por la API REST del backend, ",
      "incluyendo el metodo HTTP, la ruta, la descripcion y el nivel de acceso requerido. ",
      "La documentacion interactiva completa esta disponible en Swagger UI (", S.code("/swagger-ui.html"), ").",
    )),

    S.p(S.runs(S.bold("Tabla 8."), " Endpoints de la API REST.")),

    S.makeTable(colEnd, ["Metodo", "Ruta", "Descripcion", "Acceso"], endpoints.map(r => [
      { text: r[0], bold: true, align: S.AlignmentType.CENTER },
      { text: r[1], color: S.BLUE_DARK },
      r[2],
      { text: r[3], align: S.AlignmentType.CENTER },
    ])),
    S.p(""),

    // ── ANEXO C ──
    S.h2("Anexo C. Usuarios de prueba"),
    S.p(S.runs(
      "La base de datos incluye los siguientes usuarios de prueba, cargados mediante la migracion Flyway ",
      S.code("V3__seed_test_users.sql"), ". Las contrasenas se almacenan hasheadas con BCrypt; ",
      "aqui se muestran en texto plano unicamente para facilitar las pruebas de evaluacion.",
    )),

    S.p(S.runs(S.bold("Tabla 9."), " Usuarios de prueba precargados.")),

    S.makeTable(colUsers, ["Usuario", "Contrasena", "Rol", "Ubicacion", "Fiabilidad"], testUsers.map(r => [
      { text: r[0], bold: true },
      { text: r[1], color: S.BLUE_MID },
      { text: r[2], align: S.AlignmentType.CENTER },
      r[3],
      { text: r[4], align: S.AlignmentType.CENTER, color: S.GREEN },
    ])),
    S.p(""),

    // ── ANEXO D ──
    S.h2("Anexo D. Migraciones Flyway"),
    S.p(S.runs(
      "El esquema de la base de datos se gestiona mediante migraciones versionadas con Flyway. ",
      "Cada migracion es un fichero SQL que se ejecuta automaticamente al arrancar el backend, ",
      "garantizando la reproducibilidad y trazabilidad del esquema.",
    )),

    S.p(S.runs(S.bold("V1__init_schema.sql: "), "esquema inicial completo con 8 tablas (usuario, deporte, usuario_deporte, quedada, participacion, valoracion, comentario), 3 ENUMs PostgreSQL nativos (rol_usuario, estado_quedada, estado_asistencia), indices, foreign keys y check constraints.")),
    S.p(S.runs(S.bold("V2__seed_deportes.sql: "), "catalogo de 20 deportes con nombre, descripcion y jugadores_default (futbol, baloncesto, tenis, padel, voleibol, natacion, atletismo, ciclismo, boxeo, yoga, senderismo, rugby, balonmano, hockey, esgrima, badminton, escalada, skateboard, surf, golf).")),
    S.p(S.runs(S.bold("V3__seed_test_users.sql: "), "5 usuarios de prueba con contrasenas hasheadas en BCrypt, ubicaciones reales (Sevilla y alrededores) y roles asignados (4 USUARIO + 1 ADMIN).")),
    S.p(S.runs(S.bold("V4__add_auth_tokens.sql: "), "tablas refresh_token y password_reset_token para la gestion de autenticacion persistente y recuperacion de contrasena.")),
    S.p(S.runs(S.bold("V5__lower_min_jugadores.sql: "), "ajuste del check constraint de capacidad minima de 2 a 1 jugador, para permitir quedadas individuales (yoga, running).")),

    // ── ANEXO E ──
    S.h2("Anexo E. Configuracion Docker Compose"),
    S.p(S.runs(
      "El archivo ", S.code("docker-compose.yml"), " define los tres servicios de la aplicacion. ",
      "A continuacion se describe la configuracion de cada servicio.",
    )),

    S.p(S.runs(S.bold("db (PostgreSQL 16 Alpine): "), "imagen oficial, volumen persistente pgdata, healthcheck con pg_isready, puerto 5432, credenciales configurables por variables de entorno.")),
    S.p(S.runs(S.bold("backend (Spring Boot): "), "build multi-stage desde backend/Dockerfile, depende de db (condition: service_healthy), perfil prod activado, puerto 8080, healthcheck con curl al actuator.")),
    S.p(S.runs(S.bold("frontend (nginx Alpine): "), "build multi-stage desde frontend/Dockerfile, depende de backend, nginx como reverse proxy (envsubst para BACKEND_HOST), puerto 80, healthcheck con curl.")),

    S.p(S.runs(
      "Para arrancar el entorno completo basta con ejecutar ", S.code("docker compose up -d"),
      " desde la raiz del proyecto. Los healthchecks garantizan que cada servicio espera a sus dependencias antes de aceptar conexiones.",
    )),
  ];
}

module.exports = { buildBibliografia, buildAnexos };
