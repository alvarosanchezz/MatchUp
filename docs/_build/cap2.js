/**
 * cap2.js — Capitulo 2: Ejecucion del proyecto
 */
const S = require("./shared");

// ═══════════════════════════════════════════════════════════════════════════
// 2.1 REQUISITOS
// ═══════════════════════════════════════════════════════════════════════════
function buildRequisitos() {
  const rf = [
    ["RF01", "Registro de usuario", "El sistema permitira a un nuevo usuario registrarse proporcionando nombre, email y contrasena. El email debe ser unico. La contrasena se almacena con hash BCrypt."],
    ["RF02", "Inicio de sesion", "El sistema autenticara al usuario mediante email y contrasena, devolviendo un access token JWT (15 min) y un refresh token (7 dias)."],
    ["RF03", "Refresh de token", "El sistema permitira renovar el access token mediante un refresh token valido, aplicando rotacion (el antiguo se revoca)."],
    ["RF04", "Cierre de sesion", "El sistema revocara el refresh token activo del usuario al hacer logout."],
    ["RF05", "Recuperacion de contrasena", "El sistema generara un token temporal (1h) para restablecer la contrasena. No revelara si el email existe (prevencion de enumeracion)."],
    ["RF06", "Consulta de perfil", "El usuario autenticado podra consultar su perfil completo (GET /me). Otros usuarios veran un perfil publico sin email ni contrasena."],
    ["RF07", "Edicion de perfil", "El usuario podra actualizar su nombre, ubicacion (lat/lon) y URL de foto de perfil mediante PATCH parcial."],
    ["RF08", "Gestion de preferencias deportivas", "El usuario podra anadir, modificar y eliminar sus deportes favoritos con nivel autoevaluado (1-5) y rol preferido por deporte."],
    ["RF09", "Creacion de quedada", "Un usuario autenticado podra crear una quedada indicando deporte, fecha/hora inicio y fin, ubicacion (nombre + coordenadas), capacidad, visibilidad y descripcion."],
    ["RF10", "Listado con filtros y paginacion", "El sistema ofrecera listado paginado de quedadas con filtros por deporte, rango de fechas, estado y radio de proximidad (Haversine)."],
    ["RF11", "Edicion y cancelacion de quedada", "El organizador podra editar (PATCH) o cancelar (DELETE logico) una quedada que no este cancelada."],
    ["RF12", "Inscripcion y desinscripcion", "Un usuario podra apuntarse (join) a una quedada abierta con plazas disponibles y desapuntarse (leave) si esta pendiente o confirmado. El sistema transiciona automaticamente entre ABIERTA y COMPLETA."],
    ["RF13", "Finalizacion y gestion de asistencia", "El organizador podra finalizar una quedada y confirmar/marcar como ausente a cada participante. El sistema recalculara el fiabilidad_score."],
    ["RF14", "Valoracion entre participantes", "Tras la finalizacion, los participantes confirmados podran valorar a otros con nota doble (nivel 1-5 + deportividad 1-5). No se permite auto-valoracion ni duplicados."],
    ["RF15", "Comentarios en quedadas", "Los participantes y el organizador podran publicar comentarios en una quedada. El autor o un ADMIN podran eliminarlos."],
    ["RF16", "Catalogo de deportes", "El sistema mantendra un catalogo de 20 deportes con nombre, jugadores_default y descripcion. Los ADMIN podran crear, editar y eliminar deportes."],
    ["RF17", "Visualizacion en mapa", "El listado de quedadas se mostrara tanto en formato tarjeta como en un mapa interactivo Leaflet con markers codificados por color segun estado."],
    ["RF18", "Geolocalizacion del usuario", "El frontend solicitara la ubicacion del navegador para filtrar quedadas cercanas y precargar coordenadas al crear quedadas."],
  ];

  const rnf = [
    ["RNF01", "Seguridad", "Autenticacion JWT stateless con access token (15 min) + refresh rotativo (7 dias). Hashing BCrypt. CORS configurado. Endpoints publicos limitados a /auth/** y Swagger."],
    ["RNF02", "Proteccion de datos", "Cumplimiento RGPD: no se transfieren datos a terceros, contrasenas hasheadas, perfiles publicos sin email, prevencion de enumeracion de usuarios."],
    ["RNF03", "Rendimiento", "Respuestas API < 500 ms. Pool de conexiones HikariCP (5 max). Indices en campos de busqueda frecuente. Paginacion por defecto (20 elementos)."],
    ["RNF04", "Usabilidad", "Interfaz responsive con Angular Material. Iconografia consistente. Feedback inmediato con snackbars. Dialogs de confirmacion para acciones destructivas."],
    ["RNF05", "Escalabilidad", "Arquitectura stateless permite escalado horizontal del backend. Docker Compose para despliegue reproducible. Perfiles Spring (dev/prod)."],
    ["RNF06", "Mantenibilidad", "Arquitectura por features. Patron Controller-Service-Repository. DTOs en frontera. MapStruct para mappers. GlobalExceptionHandler centralizado."],
    ["RNF07", "Portabilidad", "Aplicacion web responsive accesible desde cualquier navegador moderno. Contenerizacion con Docker multiplataforma (Linux/Windows/Mac)."],
    ["RNF08", "Trazabilidad", "Migraciones Flyway versionadas. Swagger UI para documentacion interactiva de la API. Coleccion Postman con 45+ requests."],
  ];

  const colRF = [800, 2200, 6026];
  const colRNF = [900, 1800, 6326];

  return [
    S.h1("2. Ejecucion del proyecto"),
    S.h2("2.1 Requisitos funcionales y no funcionales"),

    S.h3("2.1.1 Requisitos funcionales"),
    S.p(S.runs("A continuacion se detallan los requisitos funcionales implementados en el sistema, ",
      "identificados a partir del analisis inicial y completados durante el desarrollo iterativo.")),

    S.p(S.runs(S.bold("Tabla 3."), " Requisitos funcionales del sistema.")),
    S.makeTable(colRF, ["ID", "Nombre", "Descripcion"], rf.map(r => [
      { text: r[0], bold: true }, r[1], r[2]
    ])),
    S.p(""),

    S.h3("2.1.2 Requisitos no funcionales"),
    S.p(S.runs(S.bold("Tabla 4."), " Requisitos no funcionales del sistema.")),
    S.makeTable(colRNF, ["ID", "Categoria", "Descripcion"], rnf.map(r => [
      { text: r[0], bold: true }, r[1], r[2]
    ])),
    S.p(""),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// 2.2 MODELO ER
// ═══════════════════════════════════════════════════════════════════════════
function buildMER() {
  return [
    S.h2("2.2 Modelo Entidad-Relacion"),
    S.p(S.runs(
      "El modelo de datos de MatchUp esta compuesto por ", S.bold("8 tablas"), " gestionadas mediante ",
      "5 migraciones Flyway versionadas y 3 tipos ENUM nativos de PostgreSQL. A continuacion se describe ",
      "cada entidad, sus atributos clave y las relaciones con su cardinalidad."
    )),

    S.h3("Entidades principales"),
    S.p(S.runs(
      S.bold("USUARIO: "), "Entidad central del sistema. Atributos: id (PK, BIGSERIAL), nombre, email (UNIQUE), ",
      "password_hash (BCrypt), ubicacion_latitud/longitud, fiabilidad_score (default 100.0), fecha_registro, ",
      "url_foto_perfil, rol (ENUM: USER/ADMIN), esta_baneado. Relaciones: 1:N con USUARIO_DEPORTE, 1:N con USUARIO_QUEDADA, ",
      "1:N con QUEDADA (como organizador), 1:N con RATING (como valorador y valorado), 1:N con COMENTARIO."
    )),
    S.p(S.runs(
      S.bold("DEPORTE: "), "Catalogo de 20 deportes. Atributos: id (PK), nombre (UNIQUE), jugadores_default, descripcion. ",
      "Relaciones: 1:N con QUEDADA, 1:N con USUARIO_DEPORTE."
    )),
    S.p(S.runs(
      S.bold("QUEDADA: "), "Evento deportivo. Atributos: id (PK), id_organizador (FK), id_deporte (FK), ",
      "fecha_hora_inicio/fin (CHECK fin > inicio), ubicacion_nombre/latitud/longitud, num_jugadores_total (CHECK >= 1), ",
      "es_publica, descripcion, estado (ENUM: ABIERTA/COMPLETA/FINALIZADA/CANCELADA). ",
      "Indices en deporte, organizador, fecha_inicio, estado, latitud y longitud."
    )),
    S.p(S.runs(
      S.bold("USUARIO_DEPORTE: "), "Tabla puente M:N entre USUARIO y DEPORTE. PK compuesta (id_usuario, id_deporte). ",
      "Atributos adicionales: nivel_autoevaluado (CHECK 1-5), rol_preferido. Cascade DELETE desde ambos lados."
    )),
    S.p(S.runs(
      S.bold("USUARIO_QUEDADA: "), "Participacion en quedadas. PK compuesta (id_usuario, id_quedada). ",
      "estado_asistencia (ENUM: PENDIENTE/CONFIRMADO/RETIRADO/AUSENTE), fecha_confirmacion. Cascade DELETE."
    )),
    S.p(S.runs(
      S.bold("RATING: "), "Valoracion entre participantes. Atributos: id (PK), id_quedada, id_valorador, id_valorado, ",
      "nivel_nota (1-5), deportividad_nota (1-5), fecha_creacion. UNIQUE(quedada, valorador, valorado). CHECK no auto-valoracion."
    )),
    S.p(S.runs(
      S.bold("COMENTARIO: "), "Hilo de comentarios por quedada. Atributos: id (PK), id_quedada (FK), id_usuario (FK), ",
      "contenido (TEXT), fecha_creacion. Cascade DELETE desde quedada."
    )),
    S.p(S.runs(
      S.bold("REFRESH_TOKEN / PASSWORD_RESET_TOKEN: "), "Tablas de seguridad anadidas en la migracion V4. ",
      "Almacenan tokens con fecha de expiracion y flag de revocacion/uso. Cascade DELETE desde usuario."
    )),

    ...S.figuraPlaceholder(2, "Diagrama Entidad-Relacion del sistema MatchUp (generado con Mermaid/dbdiagram.io)."),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// 2.3 CASOS DE USO / HISTORIAS DE USUARIO
// ═══════════════════════════════════════════════════════════════════════════
function buildCasosUso() {
  const hu = [
    ["HU-01", "No registrado", "Como visitante, quiero registrarme con mi email para poder acceder a la plataforma.", "Registro exitoso devuelve tokens. Email duplicado devuelve 409."],
    ["HU-02", "Registrado", "Como usuario, quiero iniciar sesion para acceder a mis quedadas y perfil.", "Login devuelve access + refresh token. Credenciales incorrectas devuelve 401."],
    ["HU-03", "Registrado", "Como usuario, quiero editar mi perfil y anadir mis deportes favoritos con mi nivel.", "Perfil actualizado correctamente. Nivel entre 1 y 5."],
    ["HU-04", "Registrado", "Como usuario, quiero crear una quedada indicando deporte, lugar en el mapa y horario.", "Quedada creada con estado ABIERTA. Coordenadas guardadas."],
    ["HU-05", "Registrado", "Como usuario, quiero buscar quedadas cercanas filtrando por deporte, fecha y distancia.", "Listado paginado con filtros. Mapa muestra markers."],
    ["HU-06", "Registrado", "Como usuario, quiero apuntarme a una quedada abierta con plazas disponibles.", "Participacion creada con estado PENDIENTE. Si se llena, estado pasa a COMPLETA."],
    ["HU-07", "Registrado", "Como usuario, quiero desapuntarme de una quedada si aun no ha comenzado.", "Participacion pasa a RETIRADO. Si estaba COMPLETA, vuelve a ABIERTA."],
    ["HU-08", "Organizador", "Como organizador, quiero finalizar mi quedada y confirmar quien asistio.", "Estado pasa a FINALIZADA. Puedo marcar CONFIRMADO o AUSENTE. Fiabilidad recalculada."],
    ["HU-09", "Registrado", "Como participante confirmado, quiero valorar a otros jugadores tras la quedada.", "Rating creado con nivel + deportividad (1-5). No auto-valoracion ni duplicados."],
    ["HU-10", "Registrado", "Como participante, quiero comentar en una quedada para coordinarme con el grupo.", "Comentario creado. Autor o ADMIN pueden eliminar."],
    ["HU-11", "Organizador", "Como organizador, quiero editar o cancelar mi quedada.", "PATCH actualiza campos. DELETE logico pone estado CANCELADA."],
    ["HU-12", "Registrado", "Como usuario, quiero ver el perfil publico de otros usuarios con su fiabilidad.", "Perfil publico sin email. Muestra fiabilidad_score y deportes."],
    ["HU-13", "Admin", "Como administrador, quiero gestionar el catalogo de deportes.", "CRUD completo protegido con @PreAuthorize(ADMIN). Nombre unico."],
    ["HU-14", "No registrado", "Como usuario que olvido su contrasena, quiero poder restablecerla.", "Token temporal 1h generado. Reset cambia contrasena y marca token como usado."],
  ];

  const colHU = [800, 1200, 4026, 3000];

  return [
    S.h2("2.3 Casos de uso e historias de usuario"),

    S.h3("2.3.1 Actores del sistema"),
    S.p(S.runs(
      "Se identifican cuatro actores principales en el sistema MatchUp:"
    )),
    S.p(S.runs(S.bold("No registrado: "), "Visitante que accede a la plataforma por primera vez. Puede registrarse, ",
      "iniciar sesion y solicitar restablecimiento de contrasena.")),
    S.p(S.runs(S.bold("Usuario registrado: "), "Usuario autenticado con rol USER. Puede gestionar su perfil, crear quedadas, ",
      "buscar y apuntarse a quedadas, comentar y valorar.")),
    S.p(S.runs(S.bold("Organizador: "), "Rol contextual del usuario que crea una quedada. Hereda las capacidades de ",
      "usuario registrado y ademas puede editar, cancelar, finalizar la quedada y gestionar la asistencia.")),
    S.p(S.runs(S.bold("Administrador: "), "Usuario con rol ADMIN. Hereda todo lo anterior y ademas puede gestionar ",
      "el catalogo de deportes y eliminar comentarios de cualquier usuario.")),

    ...S.figuraPlaceholder(3, "Diagrama de casos de uso del sistema MatchUp."),

    S.h3("2.3.2 Historias de usuario"),
    S.p(S.runs(S.bold("Tabla 5."), " Historias de usuario con criterios de aceptacion.")),
    S.makeTable(colHU, ["ID", "Actor", "Historia de usuario", "Criterios de aceptacion"], hu.map(h => [
      { text: h[0], bold: true }, h[1], h[2], h[3]
    ])),
    S.p(""),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// 2.4 DIAGRAMA DE CLASES
// ═══════════════════════════════════════════════════════════════════════════
function buildDiagramaClases() {
  return [
    S.h2("2.4 Diagrama de clases"),
    S.p(S.runs(
      "El backend de MatchUp sigue una ", S.bold("arquitectura por features"), " donde cada dominio funcional ",
      "(auth, user, meetup, participation, rating, comment, sport) contiene su propio paquete con las clases ",
      "Controller, Service, Repository, Entity, DTO y Mapper correspondientes. Adicionalmente existen los paquetes ",
      "transversales ", S.code("common.exception"), " (excepciones de negocio + GlobalExceptionHandler), ",
      S.code("config"), " (SecurityConfig, ApplicationConfig, OpenApiConfig) y ", S.code("security"),
      " (JwtService, JwtAuthenticationFilter)."
    )),
    S.p(S.runs(
      "Las ", S.bold("7 entidades JPA"), " principales son: Usuario, Deporte, Quedada, UsuarioDeporte, ",
      "UsuarioQuedada, Rating, Comentario, RefreshToken y PasswordResetToken. Las relaciones se mapean con ",
      "@ManyToOne (FetchType.LAZY), @OneToMany (cascade ALL, orphanRemoval) y claves primarias compuestas ",
      "con @EmbeddedId para las tablas puente. Los ENUMs de PostgreSQL se mapean con la anotacion ",
      "@JdbcTypeCode(SqlTypes.NAMED_ENUM) de Hibernate 6, evitando la necesidad de conversores personalizados."
    )),
    ...S.figuraPlaceholder(4, "Diagrama de clases simplificado del backend (entidades y servicios principales)."),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// 2.5 DOCUMENTACION TECNICA
// ═══════════════════════════════════════════════════════════════════════════
function buildDocTecnica() {
  return [
    S.h2("2.5 Documentacion tecnica"),

    // ── Arquitectura general ──
    S.h3("2.5.1 Arquitectura general"),
    S.p(S.runs(
      "MatchUp implementa una arquitectura ", S.bold("cliente-servidor de tres capas"), " clasica para aplicaciones web modernas. ",
      "El ", S.bold("frontend Angular 19"), " se ejecuta en el navegador del usuario como una Single Page Application (SPA) ",
      "y se comunica con el ", S.bold("backend Spring Boot 3.3.5"), " a traves de una API REST sobre HTTPS. ",
      "El backend gestiona la logica de negocio, la autenticacion y la persistencia contra una base de datos ",
      S.bold("PostgreSQL 16"), ". Los tres componentes se empaquetan en contenedores Docker independientes y se ",
      "orquestan con Docker Compose, lo que permite levantar todo el entorno con un unico comando."
    )),
    ...S.figuraPlaceholder(5, "Diagrama de arquitectura de despliegue (Angular + nginx | Spring Boot | PostgreSQL)."),

    // ── Patron en capas ──
    S.h3("2.5.2 Patron en capas: Controller - Service - Repository - Entity"),
    S.p(S.runs(
      "Cada feature del backend sigue un patron estricto de capas con responsabilidades bien definidas:"
    )),
    S.p(S.runs(
      S.bold("Controller: "), "Recibe las peticiones HTTP, valida los datos de entrada mediante Bean Validation (@Valid) ",
      "y delega la logica al Service. Utiliza @AuthenticationPrincipal para obtener el usuario autenticado. ",
      "Documentado con anotaciones de Springdoc/OpenAPI (@Operation, @Tag)."
    )),
    S.p(S.runs(
      S.bold("Service: "), "Contiene toda la logica de negocio y las reglas de validacion. Gestiona transacciones con ",
      "@Transactional (readOnly=true para consultas). Lanza excepciones semanticas (BusinessException, NotFoundException, ",
      "ConflictException) que el GlobalExceptionHandler traduce a ProblemDetail RFC 7807."
    )),
    S.p(S.runs(
      S.bold("Repository: "), "Interfaces que extienden JpaRepository y JpaSpecificationExecutor. Queries personalizadas ",
      "con metodos derivados o @Query JPQL. La busqueda geoespacial usa Specification<Quedada> con Criteria API."
    )),
    S.p(S.runs(
      S.bold("Entity: "), "Clases JPA anotadas con Lombok (@Data, @Builder). ENUMs PostgreSQL mapeados con ",
      "@JdbcTypeCode(SqlTypes.NAMED_ENUM). Relaciones LAZY por defecto. @EqualsAndHashCode solo por ID."
    )),
    S.p(S.runs(
      S.bold("DTO (Data Transfer Objects): "), "Records Java inmutables para request/response. Los mappers ",
      "MapStruct generan el codigo de conversion en tiempo de compilacion, eliminando reflection."
    )),

    // ── Seguridad ──
    S.h3("2.5.3 Seguridad: JWT con refresh rotativo y BCrypt"),
    S.p(S.runs(
      "El sistema de seguridad de MatchUp se basa en ", S.bold("JSON Web Tokens (JWT)"), " con un esquema de doble token:"
    )),
    S.p(S.runs(
      S.bold("Access token: "), "JWT firmado con HMAC-SHA256 usando una clave secreta de 256+ bits. Expiracion de 15 minutos. ",
      "Contiene el email del usuario como subject. Se envia en el header Authorization: Bearer <token>."
    )),
    S.p(S.runs(
      S.bold("Refresh token: "), "UUID aleatorio almacenado en base de datos con fecha de expiracion de 7 dias y flag de revocacion. ",
      "Al renovar, el token antiguo se marca como revocado y se emite uno nuevo (", S.bold("rotacion"), "), lo que mitiga ",
      "el riesgo de robo de tokens: un token comprometido solo puede usarse una vez."
    )),
    S.p(S.runs(
      "El flujo completo es: (1) El usuario se autentica con email/contrasena; (2) el backend valida con ",
      "AuthenticationManager de Spring Security y BCrypt; (3) se genera un access token JWT y un refresh token; ",
      "(4) el frontend almacena ambos tokens; (5) cada peticion incluye el access token en el header; ",
      "(6) el JwtAuthenticationFilter valida el token en cada request; (7) al expirar, el frontend usa el ",
      "refresh token para obtener un nuevo par de tokens transparentemente gracias al refresh interceptor."
    )),
    S.p(S.runs(
      "Las contrasenas se almacenan hasheadas con ", S.bold("BCrypt"), " (factor de coste 10), un algoritmo ",
      "disenado para ser computacionalmente costoso y resistente a ataques con GPU. Spring Security proporciona ",
      "BCryptPasswordEncoder como implementacion por defecto."
    )),
    S.p(S.runs(
      "El ", S.bold("GlobalExceptionHandler"), " centraliza el manejo de errores siguiendo el estandar ",
      S.bold("RFC 7807 (Problem Details for HTTP APIs)"), ". Cada excepcion se traduce a un objeto ProblemDetail ",
      "con campos estandarizados (type, title, status, detail, instance), lo que permite al frontend parsear ",
      "los errores de forma uniforme. Se cubren todos los codigos relevantes: 400 (validacion, negocio), ",
      "401 (credenciales, token invalido), 403 (acceso denegado), 404 (no encontrado), 409 (conflicto) y 500."
    )),

    // ── Persistencia ──
    S.h3("2.5.4 Persistencia: Flyway y Hibernate 6"),
    S.p(S.runs(
      "El esquema de base de datos se gestiona mediante ", S.bold("Flyway"), " con 5 migraciones versionadas ",
      "en SQL puro, lo que garantiza la reproducibilidad y trazabilidad de cada cambio:"
    )),
    S.p(S.runs(S.bold("V1__init_schema.sql: "), "Esquema inicial con 7 tablas, 3 ENUMs nativos, indices, foreign keys y check constraints.")),
    S.p(S.runs(S.bold("V2__seed_deportes.sql: "), "Catalogo inicial de 20 deportes con jugadores_default y descripcion.")),
    S.p(S.runs(S.bold("V3__seed_test_users.sql: "), "5 usuarios de prueba con hashes BCrypt reales y preferencias deportivas.")),
    S.p(S.runs(S.bold("V4__add_auth_tokens.sql: "), "Tablas refresh_token y password_reset_token para el sistema de autenticacion.")),
    S.p(S.runs(S.bold("V5__lower_min_jugadores.sql: "), "Ajuste del constraint de capacidad minima de 2 a 1 para deportes individuales (ej. tenis).")),
    S.p(S.runs(
      "Hibernate 6 se configura con ", S.code("ddl-auto: validate"), " en desarrollo y ", S.code("ddl-auto: none"),
      " en produccion, delegando toda la gestion del esquema a Flyway. Los ENUMs de PostgreSQL se mapean ",
      "directamente con ", S.code("@JdbcTypeCode(SqlTypes.NAMED_ENUM)"), ", una funcionalidad nativa de Hibernate 6 ",
      "que elimina la necesidad de conversores personalizados y mantiene la coherencia de tipos entre Java y la base de datos."
    )),

    // ── Busqueda geoespacial ──
    S.h3("2.5.5 Busqueda geoespacial: formula de Haversine"),
    S.p(S.runs(
      "Una de las funcionalidades diferenciadoras de MatchUp es la busqueda de quedadas por proximidad geografica. ",
      "El sistema implementa la ", S.bold("formula de Haversine"), " directamente en la capa de persistencia ",
      "mediante JPA Criteria API, lo que permite filtrar quedadas por radio de distancia (en km) de forma eficiente ",
      "sin depender de extensiones PostGIS."
    )),
    S.p(S.runs("La formula calcula la distancia entre dos puntos en una esfera:")),
    S.p(S.runs(S.code("d = 6371 * acos( cos(rad(lat1)) * cos(rad(lat2)) * cos(rad(lon2) - rad(lon1)) + sin(rad(lat1)) * sin(rad(lat2)) )")), { align: S.AlignmentType.CENTER }),
    S.p(S.runs(
      "Donde 6371 es el radio medio de la Tierra en kilometros. La implementacion en ", S.code("QuedadaSpecification"),
      " construye esta expresion usando funciones SQL nativas de PostgreSQL (radians, cos, sin, acos) ",
      "invocadas mediante ", S.code("cb.function()"), " del Criteria Builder, lo que genera la consulta SQL optimizada ",
      "directamente en la base de datos."
    )),

    // ── Frontend ──
    S.h3("2.5.6 Frontend Angular 19"),
    S.p(S.runs(
      "El frontend se ha desarrollado con ", S.bold("Angular 19"), " utilizando las ultimas convenciones del framework:"
    )),
    S.p(S.runs(
      S.bold("Standalone components: "), "Todos los componentes se declaran como standalone, eliminando la necesidad de ",
      "NgModules. Cada componente declara explicitamente sus imports, mejorando la trazabilidad de dependencias."
    )),
    S.p(S.runs(
      S.bold("Signals: "), "Se utilizan Angular Signals (", S.code("signal()"), ", ", S.code("computed()"),
      ") para la gestion de estado reactivo en los componentes, reemplazando el patron tradicional de ",
      "propiedades mutables. Esto permite una deteccion de cambios mas eficiente y un codigo mas declarativo."
    )),
    S.p(S.runs(
      S.bold("Functional interceptors: "), "La autenticacion y el refresh de tokens se gestionan con interceptors funcionales ",
      "(", S.code("HttpInterceptorFn"), "). El ", S.code("authInterceptor"), " anade el Bearer token a cada peticion. ",
      "El ", S.code("refreshInterceptor"), " captura los errores 401 y ejecuta el refresh automaticamente, ",
      "utilizando un ", S.code("BehaviorSubject"), " como lock para serializar multiples peticiones concurrentes ",
      "durante el proceso de renovacion del token."
    )),
    S.p(S.runs(
      S.bold("Lazy loading: "), "Todas las rutas utilizan ", S.code("loadComponent"), " con imports dinamicos, ",
      "asegurando que cada vista se carga bajo demanda. Esto reduce drasticamente el tamano del bundle inicial."
    )),
    S.p(S.runs(
      S.bold("Angular Material: "), "Se emplea como libreria de componentes UI para formularios, tablas, dialogos, ",
      "snackbars, tabs, paginacion, chips y expansiones, garantizando una experiencia visual coherente con Material Design."
    )),
    S.p(S.runs(
      S.bold("Tailwind CSS: "), "Se combina con Angular Material para utilidades de espaciado, layout y responsive design, ",
      "reduciendo la necesidad de CSS personalizado."
    )),

    // ── Mapas ──
    S.h3("2.5.7 Mapas interactivos: Leaflet + OpenStreetMap"),
    S.p(S.runs(
      "La integracion de mapas se realiza con ", S.bold("Leaflet 1.9.4"), " y tiles de ", S.bold("OpenStreetMap"),
      ". La eleccion de esta combinacion frente a Google Maps se justifica por tres razones fundamentales: ",
      "(1) es completamente gratuita sin limites de API; (2) es open source y no requiere API keys; ",
      "(3) cumple con el RGPD al no enviar datos de los usuarios a servidores de Google."
    )),
    S.p(S.runs(
      "El mapa principal del listado de quedadas muestra ", S.bold("markers codificados por color"), " segun el estado ",
      "de cada quedada (verde = Abierta, naranja = Completa, gris = Finalizada, rojo = Cancelada). ",
      "Cada marker tiene un popup con informacion resumida y un boton de navegacion al detalle. ",
      "El detalle de cada quedada incluye un mini-mapa estatico centrado en la ubicacion del evento. ",
      "El formulario de creacion utiliza geocoding de ", S.bold("Nominatim"), " (API gratuita de OpenStreetMap) ",
      "para convertir nombres de lugar en coordenadas."
    )),
    ...S.figuraPlaceholder(6, "Vista del mapa interactivo con markers de quedadas codificados por estado."),

    // ── Tests ──
    S.h3("2.5.8 Testing"),
    S.p(S.runs(
      "La estrategia de testing de MatchUp combina tests unitarios y de integracion:"
    )),
    S.p(S.runs(
      S.bold("6 clases de tests unitarios con Mockito: "), "AuthServiceTest, QuedadaServiceTest, ParticipacionServiceTest, ",
      "RatingServiceTest, ComentarioServiceTest y DeporteServiceTest. Cada test verifica la logica de negocio ",
      "de forma aislada, mockeando las dependencias (repositorios) con @Mock y @InjectMocks."
    )),
    S.p(S.runs(
      S.bold("1 test de integracion E2E con Testcontainers (14 pasos): "), "El FullFlowIntegrationTest levanta ",
      "un contenedor PostgreSQL 16 real con @Testcontainers y ejecuta un flujo completo de 14 pasos ordenados: ",
      "registrar dos usuarios, login, crear quedada, listar, apuntarse, finalizar, confirmar asistencia, ",
      "verificar fiabilidad y valorar. Utiliza MockMvc con @SpringBootTest(MOCK) y @AutoConfigureMockMvc."
    )),
    S.p(S.runs(
      S.bold("Coleccion Postman: "), "45+ requests organizadas por carpetas (Auth, Users, Meetups, Participations, ",
      "Ratings, Comments, Sports) para testing manual de todos los endpoints de la API."
    )),
    ...S.figuraPlaceholder(7, "Ejecucion exitosa del FullFlowIntegrationTest (14/14 tests verdes)."),
    ...S.figuraPlaceholder(8, "Coleccion Postman con todas las requests organizadas por carpeta."),

    // ── Estructura de carpetas ──
    S.h3("2.5.9 Estructura del proyecto"),
    S.p(S.runs(S.bold("Backend (estructura por features):"))),
    S.codeBlock([
      "backend/src/main/java/com/matchup/",
      "  auth/        controller/ service/ dto/ entity/ repository/",
      "  user/        controller/ service/ dto/ entity/ mapper/ repository/",
      "  meetup/      controller/ service/ dto/ entity/ mapper/ repository/",
      "  participation/ controller/ service/ dto/ entity/ repository/",
      "  rating/      controller/ service/ dto/ entity/ repository/",
      "  comment/     controller/ service/ dto/ entity/ repository/",
      "  sport/       controller/ service/ dto/ entity/ mapper/ repository/",
      "  common/      exception/ (GlobalExceptionHandler, BusinessException, ...)",
      "  config/      SecurityConfig, ApplicationConfig, OpenApiConfig",
      "  security/    JwtService, JwtAuthenticationFilter",
    ]),
    S.p(S.runs(S.bold("Frontend (Angular 19):"))),
    S.codeBlock([
      "frontend/src/app/",
      "  core/",
      "    guards/       auth.guard.ts, admin.guard.ts",
      "    interceptors/  auth.interceptor.ts, refresh.interceptor.ts",
      "    models/        auth, meetup, user, sport, rating, comment, page, problem-detail",
      "    services/      auth, api, meetup, user, sport, participation, rating, comment, token",
      "  features/",
      "    auth/          login, register, forgot-password, reset-password",
      "    meetups/       meetups (listado+mapa), meetup-detail, meetup-form, rate-dialog",
      "    profile/       profile, add-sport-dialog",
      "    users/         user-profile",
      "    landing/       landing",
      "    sports/        sports",
      "  shared/",
      "    layout/        main-layout, auth-layout",
      "    components/    meetup-card, confirm-dialog",
    ]),

    // ── Capturas de la app ──
    S.h3("2.5.10 Capturas de la aplicacion"),
    ...S.figuraPlaceholder(9, "Pantalla de login / registro de MatchUp."),
    ...S.figuraPlaceholder(10, "Listado de quedadas con filtros y paginacion."),
    ...S.figuraPlaceholder(11, "Detalle de quedada con participantes, mapa y comentarios."),
    ...S.figuraPlaceholder(12, "Formulario de creacion de quedada con selector de ubicacion en mapa."),
    ...S.figuraPlaceholder(13, "Perfil de usuario con tabs (datos, deportes, quedadas)."),
    ...S.figuraPlaceholder(14, "Dialogo de valoracion de participantes."),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// 2.6 ENLACES AL REPOSITORIO
// ═══════════════════════════════════════════════════════════════════════════
function buildEnlaces() {
  return [
    S.h2("2.6 Enlaces al repositorio"),
    S.p(S.runs(
      "El codigo fuente completo del proyecto esta disponible en el siguiente repositorio de GitHub:"
    )),
    S.p(S.runs(S.bold("Repositorio: "), S.code("https://github.com/alvarosanchezz/MatchUp"))),
    S.p(S.runs(
      "El repositorio contiene el backend (Spring Boot), el frontend (Angular), los Dockerfiles, ",
      "el docker-compose.yml, las migraciones Flyway, la coleccion Postman y los scripts de base de datos."
    )),
    S.p(S.runs(
      S.bold("Nota sobre el despliegue: "), "MatchUp no dispone de un despliegue publico en internet. ",
      "El profesor evaluador montara la aplicacion en el servidor del centro educativo utilizando los ",
      "Dockerfiles y el docker-compose.yml incluidos en el repositorio, garantizando un despliegue ",
      "reproducible con un unico comando: ", S.code("docker compose up --build"),  "."
    )),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// 2.7 DOCUMENTACION DEL SISTEMA
// ═══════════════════════════════════════════════════════════════════════════
function buildDocSistema() {
  return [
    S.h2("2.7 Documentacion del sistema"),

    // ── 2.7.1 Manual de instalacion ──
    S.h3("2.7.1 Manual de instalacion"),
    S.p(S.runs("A continuacion se describen tres modos de instalacion y ejecucion de MatchUp:")),

    S.p(S.runs(S.bold("Modo 1: Docker Compose (recomendado)"))),
    S.p(S.runs("Prerequisitos: Docker y Docker Compose instalados.")),
    S.codeBlock([
      "# Clonar el repositorio",
      "git clone https://github.com/alvarosanchezz/MatchUp.git",
      "cd MatchUp",
      "",
      "# Levantar los 3 servicios (db + backend + frontend)",
      "docker compose up --build",
      "",
      "# La aplicacion estara disponible en:",
      "#   Frontend: http://localhost",
      "#   Backend API: http://localhost:8080",
      "#   Swagger UI: http://localhost:8080/swagger-ui.html",
    ]),
    S.p(S.runs(
      "Docker Compose levanta PostgreSQL 16 con healthcheck, espera a que este listo, arranca el backend ",
      "(que ejecuta las migraciones Flyway automaticamente) y finalmente el frontend nginx. ",
      "Los datos persisten en un volumen Docker (pgdata)."
    )),

    S.p(S.runs(S.bold("Modo 2: Instalacion manual"))),
    S.p(S.runs("Prerequisitos: Java 21, Node.js 20+, PostgreSQL 16, Maven.")),
    S.codeBlock([
      "# 1. Crear la base de datos",
      "psql -U postgres -f backend/scripts/01_create_db.sql",
      "psql -U postgres -f backend/scripts/02_grant_permissions.sql",
      "",
      "# 2. Arrancar el backend",
      "cd backend",
      "mvn spring-boot:run",
      "",
      "# 3. Arrancar el frontend",
      "cd frontend",
      "npm install",
      "ng serve",
    ]),

    S.p(S.runs(S.bold("Modo 3: Desarrollo"))),
    S.p(S.runs(
      "Igual que el modo manual, pero con el perfil ", S.code("dev"), " activo (por defecto). ",
      "Esto habilita SQL logging, Hibernate format_sql y logs DEBUG para Flyway y la aplicacion."
    )),

    S.p(S.runs(S.bold("Usuarios de prueba"), " (creados por la migracion V3):")),
    S.makeTable([2400, 2400, 2026, 2200], ["Nombre", "Email", "Contrasena", "Rol"],
      [
        ["Ana Garcia", "ana.garcia@matchup.test", "matchup123", "USER"],
        ["Carlos Perez", "carlos.perez@matchup.test", "carlos456", "USER"],
        ["Laura Martin", "laura.martin@matchup.test", "laura789", "USER"],
        [{ text: "Admin MatchUp", bold: true }, "admin@matchup.test", "admin2024", { text: "ADMIN", bold: true, color: S.ORANGE }],
        ["Pedro Lopez", "pedro.lopez@matchup.test", "pedro321", "USER"],
      ]
    ),
    S.p(""),
    ...S.figuraPlaceholder(15, "Docker Compose levantando los 3 servicios de MatchUp."),

    // ── 2.7.2 Manual de usuario ──
    S.h3("2.7.2 Manual de usuario"),
    S.p(S.runs(
      "A continuacion se describe el flujo principal de uso de la aplicacion paso a paso."
    )),

    S.p(S.runs(S.bold("1. Registro e inicio de sesion"))),
    S.p(S.runs(
      "El usuario accede a la pantalla de login y puede registrarse proporcionando nombre, email y contrasena. ",
      "Tras el registro, el sistema inicia sesion automaticamente y redirige al listado de quedadas."
    )),
    ...S.figuraPlaceholder(16, "Pantalla de registro de nuevo usuario."),

    S.p(S.runs(S.bold("2. Completar perfil y anadir deportes"))),
    S.p(S.runs(
      "Desde la seccion 'Mi Perfil', el usuario puede editar su nombre, ubicacion y foto de perfil. ",
      "En la pestana de deportes, puede anadir sus deportes favoritos indicando el nivel autoevaluado (1-5) ",
      "y el rol preferido (ej. 'Portero', 'Delantero')."
    )),
    ...S.figuraPlaceholder(17, "Perfil de usuario con edicion de deportes favoritos."),

    S.p(S.runs(S.bold("3. Crear una quedada"))),
    S.p(S.runs(
      "El usuario pulsa 'Nueva quedada' y rellena el formulario: deporte, fecha y hora, ubicacion (seleccionable ",
      "en el mapa con geocoding), numero de jugadores, visibilidad y descripcion. Al crear, la quedada aparece ",
      "con estado ABIERTA en el listado y en el mapa."
    )),
    ...S.figuraPlaceholder(18, "Formulario de creacion de quedada con mapa interactivo."),

    S.p(S.runs(S.bold("4. Buscar quedadas y visualizar en mapa"))),
    S.p(S.runs(
      "El listado principal ofrece dos vistas: tarjetas y mapa. Los filtros permiten buscar por deporte, rango de ",
      "fechas, estado y radio de proximidad (activable con 'Usar mi ubicacion'). Los markers del mapa estan ",
      "codificados por color segun el estado de la quedada."
    )),
    ...S.figuraPlaceholder(19, "Listado de quedadas con vista de mapa y filtros activos."),

    S.p(S.runs(S.bold("5. Apuntarse a una quedada"))),
    S.p(S.runs(
      "Desde el detalle de una quedada abierta, el usuario pulsa 'Apuntarme'. Su estado de participacion sera ",
      "PENDIENTE. Si se llena el cupo, la quedada pasa automaticamente a COMPLETA."
    )),

    S.p(S.runs(S.bold("6. Finalizar y gestionar asistencia"))),
    S.p(S.runs(
      "El organizador finaliza la quedada y puede marcar a cada participante como CONFIRMADO (asistio) o ",
      "AUSENTE (no se presento). El sistema recalcula automaticamente el fiabilidad_score de cada usuario afectado."
    )),

    S.p(S.runs(S.bold("7. Valorar participantes"))),
    S.p(S.runs(
      "Tras la finalizacion, los participantes confirmados pueden valorar a los demas con una nota doble: ",
      "nivel deportivo (1-5) y deportividad (1-5). Las valoraciones son visibles en el perfil del usuario valorado."
    )),
    ...S.figuraPlaceholder(20, "Dialogo de valoracion de participantes tras finalizar una quedada."),

    // ── 2.7.3 Presentacion ──
    S.h3("2.7.3 Enlace a la presentacion"),
    S.p(S.runs(
      "La presentacion de defensa del proyecto se encuentra en el archivo ", S.code("docs/presentacion-MatchUp.pptx"),
      " incluido junto a esta memoria. [Se completara en el Bloque 5 del desarrollo]."
    )),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════
function buildCapitulo2() {
  return [
    ...buildRequisitos(),
    ...buildMER(),
    ...buildCasosUso(),
    ...buildDiagramaClases(),
    ...buildDocTecnica(),
    ...buildEnlaces(),
    ...buildDocSistema(),
  ];
}

module.exports = { buildCapitulo2 };
