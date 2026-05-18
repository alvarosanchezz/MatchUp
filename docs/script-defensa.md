# Script de Defensa — MatchUp

## Datos de la defensa
- **Proyecto:** MatchUp — Plataforma web de quedadas deportivas
- **Autor:** Álvaro Sánchez Rodríguez
- **Tutor:** Vladimir Rico Hebles
- **Centro:** IES Los Alcores
- **Fecha:** 19 de mayo de 2026
- **Duración estimada:** 15-20 minutos de exposición + preguntas del tribunal

---

## GUION DE LA PRESENTACIÓN

### Diapositiva 1 — Portada (30 segundos)

"Buenos días, mi nombre es Álvaro Sánchez Rodríguez y voy a presentar mi Trabajo de Fin de Grado: MatchUp, una plataforma web de quedadas deportivas. El proyecto ha sido tutorizado por Vladimir Rico Hebles."

### Diapositiva 2 — ¿Qué es MatchUp? (1 minuto)

"MatchUp es una aplicación web fullstack que permite a cualquier persona crear, descubrir y participar en quedadas deportivas en su zona geográfica. La idea nace de un problema real: organizar un partido de fútbol, una sesión de pádel o una ruta de senderismo con desconocidos sigue siendo un proceso fragmentado, basado en grupos de WhatsApp o carteles en polideportivos. MatchUp centraliza todo ese flujo en una única plataforma con búsqueda geolocalizada, gestión de asistencia y un sistema de fiabilidad que incentiva el compromiso."

### Diapositiva 3 — Problema y justificación (1 minuto)

"Las aplicaciones deportivas actuales como Strava o Nike Training Club se centran en el individuo. Plataformas de eventos como Meetup no tienen funcionalidades específicas para deporte. Y Timpik, que era la alternativa más cercana en España, cesó su actividad. Existe un vacío claro: no hay una herramienta que combine descubrimiento local de quedadas, filtrado por deporte y nivel, y mecanismos de confianza entre participantes. Ahí es donde entra MatchUp."

### Diapositiva 4 — Objetivos (45 segundos)

"El objetivo general era desarrollar una plataforma web funcional para el ciclo completo de las quedadas deportivas. Los cinco objetivos específicos abarcan: autenticación JWT con refresh rotativo, búsqueda geoespacial con Haversine, sistema de valoración y fiabilidad, interfaz responsive con mapa interactivo, y contenerización con Docker Compose. Todos han sido cumplidos."

### Diapositiva 5 — Stack tecnológico (1 minuto)

"En el backend he utilizado Spring Boot 3.3.5 sobre Java 21, con PostgreSQL 16 y Flyway para las migraciones. La seguridad se gestiona con JWT y BCrypt. En el frontend, Angular 19 con standalone components, Angular Material, Tailwind CSS y Leaflet para los mapas. Todo el proyecto se despliega con Docker Compose en tres contenedores. Todo el software es gratuito y de código abierto."

### Diapositiva 6 — Arquitectura general (1 minuto)

"La arquitectura sigue el patrón clásico de tres capas: frontend SPA, API REST y base de datos relacional. El frontend Angular se comunica con el backend Spring Boot mediante peticiones HTTP con JWT en la cabecera Authorization. El backend expone 31 endpoints REST organizados por features: auth, user, meetup, participation, rating, comment y sport. La base de datos PostgreSQL almacena 8 tablas con 3 ENUMs nativos."

### Diapositiva 7 — Base de datos y modelo E-R (1 minuto)

"El modelo relacional consta de 8 entidades principales. La entidad central es Quedada, que se relaciona con Usuario como organizador, con Participación como tabla intermedia para las inscripciones, con Valoración para los ratings post-evento y con Comentario para el hilo de discusión. Usuario tiene una relación muchos a muchos con Deporte a través de UsuarioDeporte, que almacena el nivel y rol preferido por deporte. También existen tablas para RefreshToken y PasswordResetToken."

### Diapositiva 8 — Seguridad: JWT y refresh rotativo (1.5 minutos)

"La autenticación es uno de los puntos fuertes del proyecto. Utilizo JWT stateless con dos tokens: un access token de 15 minutos firmado con HMAC-SHA256, y un refresh token de 7 días almacenado en base de datos. Cuando el access token expira, el frontend lo renueva automáticamente mediante un interceptor Angular que implementa el patrón BehaviorSubject para evitar race conditions con peticiones concurrentes. Cada vez que se usa el refresh token, el anterior se revoca y se genera uno nuevo — eso es la rotación. Las contraseñas se almacenan con BCrypt y el endpoint de forgot-password no revela si el email existe, previniendo la enumeración de usuarios."

### Diapositiva 9 — Búsqueda geoespacial: Haversine (1 minuto)

"Una funcionalidad diferenciadora es la búsqueda por proximidad. He implementado la fórmula de Haversine directamente en JPA Criteria API, utilizando funciones trigonométricas de PostgreSQL: seno, coseno, arcocoseno y radianes. Esto permite filtrar quedadas en un radio configurable en kilómetros desde la ubicación del usuario. El resultado se muestra tanto en tarjetas como en un mapa Leaflet con marcadores coloreados por estado: verde para abierta, amarillo para completa, gris para finalizada."

### Diapositiva 10 — Sistema de fiabilidad (45 segundos)

"Cada usuario tiene un fiabilidad_score que se recalcula automáticamente cuando el organizador gestiona la asistencia. Es el porcentaje de asistencias confirmadas sobre el total de asistencias gestionadas. Si un usuario se apunta a 10 quedadas y asiste a 8, su fiabilidad es del 80%. Esto genera un entorno de confianza y desincentiva el abandono."

### Diapositiva 11 — Frontend: Angular 19 (1 minuto)

"El frontend está construido con Angular 19 usando exclusivamente standalone components, sin NgModules. La navegación usa lazy loading para optimizar la carga inicial. Angular Material proporciona los componentes UI, Tailwind CSS los estilos utilitarios, y Leaflet con OpenStreetMap los mapas interactivos. Los formularios utilizan validación reactiva y las acciones destructivas siempre piden confirmación mediante diálogos."

### Diapositivas 12-14 — Demo en capturas (2 minutos)

"Aquí pueden ver las pantallas principales: el listado de quedadas con el mapa y los filtros, el detalle de una quedada con su mini-mapa y las acciones disponibles, el perfil de usuario con sus preferencias deportivas, y el formulario de creación de quedada con selección de ubicación en el mapa."

### Diapositiva 15 — Testing (1 minuto)

"La estrategia de testing combina tres niveles. Seis tests unitarios con Mockito que verifican la lógica de negocio de los servicios de forma aislada. Un test de integración con Testcontainers que levanta un PostgreSQL real en Docker y ejecuta un flujo completo de 14 pasos: desde el registro hasta la valoración. Y más de 45 peticiones Postman organizadas por endpoint para validación manual de la API."

### Diapositiva 16 — Docker y despliegue (45 segundos)

"El despliegue se realiza con Docker Compose: tres servicios con Dockerfiles multi-stage que separan build y runtime. PostgreSQL con volumen persistente, el backend con perfil prod activado, y nginx como servidor del frontend y reverse proxy. Healthchecks en los tres servicios garantizan el orden de arranque. Un solo comando — docker compose up — levanta todo el entorno."

### Diapositiva 17 — Planificación y desviaciones (45 segundos)

"El proyecto se desarrolló en 10 fases durante 3 semanas, con una estimación de 112 horas. El tiempo real invertido fue de 114 horas, una desviación del 1,8%. Las fases que más se desviaron fueron autenticación y frontend, compensadas por fases más ágiles como planificación y lógica de negocio."

### Diapositiva 18 — Mejoras futuras (45 segundos)

"Entre las mejoras identificadas: notificaciones en tiempo real con WebSocket, chat por quedada, gamificación con insignias, migración a PostGIS para búsquedas geoespaciales optimizadas, caché con Redis, CI/CD con GitHub Actions, y conversión a PWA para mejorar la experiencia móvil."

### Diapositiva 19 — Conclusiones (1 minuto)

"Todos los objetivos planteados se han cumplido satisfactoriamente. El proyecto demuestra la viabilidad de construir una plataforma web completa con tecnologías modernas y de código abierto. Las lecciones más valiosas han sido la importancia de la arquitectura por features, la complejidad real de implementar seguridad JWT correctamente, y el valor de Testcontainers para tests de integración realistas. MatchUp no es solo un ejercicio académico: es una herramienta que resuelve una necesidad real y tiene potencial de evolución comercial."

### Diapositiva 20 — Cierre (15 segundos)

"Eso es todo. Quedo a disposición del tribunal para cualquier pregunta. Muchas gracias."

---

## 15 PREGUNTAS ANTICIPADAS DEL TRIBUNAL

### P1: ¿Por qué elegiste Spring Boot en lugar de otro framework como Django o Express?

"Spring Boot es el framework más demandado en el mercado laboral español para desarrollo backend enterprise. Además, se ajusta al temario del ciclo formativo. Su ecosistema — Spring Security, Spring Data JPA, Springdoc — cubre todas las necesidades del proyecto sin dependencias externas. Django habría sido más rápido para prototipar pero menos representativo de lo que encontraré en el mundo laboral, y Express no ofrece la misma robustez en tipado y estructura que Java 21."

### P2: ¿Qué ventajas tiene JWT frente a sesiones tradicionales?

"JWT es stateless: el servidor no necesita almacenar estado de sesión, lo que permite escalar horizontalmente añadiendo más instancias del backend sin compartir memoria. Además, al ser un token autocontenido, cada petición se autentica de forma independiente. La desventaja es que no se puede revocar un access token antes de su expiración, pero eso lo compenso con tokens de corta duración (15 minutos) y refresh token rotativo almacenado en base de datos, que sí es revocable."

### P3: ¿Qué es el refresh token rotativo y por qué lo implementaste?

"Cuando el access token expira, el frontend envía el refresh token para obtener uno nuevo. En la rotación, cada vez que se usa un refresh token, se genera uno nuevo y el anterior se revoca. Esto limita la ventana de ataque si un refresh token es comprometido: solo es válido para un único uso. Además, si detecto que se intenta usar un refresh token ya revocado, puedo asumir que ha habido un robo y revocar todos los tokens del usuario."

### P4: ¿Cómo funciona la fórmula de Haversine y por qué no usaste PostGIS?

"Haversine calcula la distancia entre dos puntos en una esfera usando sus coordenadas geográficas. Aplica funciones trigonométricas — seno, coseno y arcocoseno — sobre la diferencia de latitudes y longitudes, multiplicando por el radio de la Tierra. La implementé directamente en JPA Criteria API usando cb.function para las funciones de PostgreSQL. No usé PostGIS porque habría añadido una dependencia y complejidad adicional al despliegue Docker que no se justificaba para el volumen de datos del MVP. Sin embargo, lo identifico como mejora futura para escalar."

### P5: ¿Cómo gestionas los errores en la API?

"Uso un GlobalExceptionHandler con @ControllerAdvice que captura todas las excepciones y las transforma en respuestas con formato ProblemDetail según el RFC 7807. Cada error incluye type, title, status y detail. Esto estandariza todas las respuestas de error de la API y simplifica el manejo en el frontend, ya que Angular siempre recibe la misma estructura independientemente del tipo de error."

### P6: ¿Por qué Angular 19 y no React o Vue?

"Angular ofrece una solución completa out-of-the-box: routing, formularios reactivos, HTTP client, inyección de dependencias, todo integrado. React requiere ensamblar librerías externas para cada funcionalidad. Para un proyecto fullstack individual con plazo ajustado, la productividad de Angular con sus generadores CLI y Angular Material fue determinante. Además, Angular 19 introduce standalone components que eliminan la complejidad de los NgModules, y signals para una reactividad más intuitiva."

### P7: ¿Cómo funciona el sistema de valoraciones?

"Tras finalizar una quedada, el organizador marca a cada participante como confirmado o ausente. Solo los participantes confirmados pueden valorar a otros participantes confirmados y al organizador. La valoración es doble: nivel deportivo (1-5) y deportividad (1-5). El sistema previene auto-valoración y duplicados. Las valoraciones recibidas se pueden consultar en el perfil de cada usuario."

### P8: ¿Qué medidas de seguridad implementaste además de JWT?

"Contraseñas hasheadas con BCrypt (factor 10), CORS configurado para aceptar solo el origen del frontend, endpoints públicos limitados a /auth/** y Swagger. El forgot-password no revela si un email existe, previniendo enumeración. Todas las rutas excepto las públicas requieren un JWT válido. Los ENUMs de PostgreSQL previenen inyección de estados inválidos a nivel de base de datos. Y las acciones sobre recursos (editar quedada, eliminar comentario) validan que el usuario sea el propietario o ADMIN."

### P9: ¿Cómo manejas las peticiones concurrentes en el refresh del token en Angular?

"Uso el patrón BehaviorSubject en el interceptor. Cuando una petición recibe un 401, el interceptor comprueba si ya hay un refresh en curso. Si no lo hay, marca un flag isRefreshing=true y lanza el refresh. Las peticiones que llegan mientras tanto se encolan en un BehaviorSubject. Cuando el refresh completa, el BehaviorSubject emite el nuevo token y todas las peticiones encoladas se reenvían con el token actualizado. Esto evita que múltiples peticiones simultáneas lancen refreshes duplicados."

### P10: ¿Por qué usaste Flyway para las migraciones?

"Flyway versiona el esquema de base de datos de forma incremental y reproducible. Cada migración es un archivo SQL con un número de versión que se ejecuta una sola vez y en orden. Esto garantiza que cualquier persona pueda recrear exactamente el mismo esquema partiendo de cero, y que los cambios de esquema queden documentados en el historial de Git. Además, al arrancar la aplicación, Flyway verifica automáticamente que el esquema está actualizado."

### P11: ¿Qué diferencia hay entre los tests unitarios y el test de integración?

"Los tests unitarios con Mockito aíslan cada servicio reemplazando sus dependencias por mocks. Verifican la lógica de negocio pura: que un usuario no pueda valorarse a sí mismo, que el fiabilidad_score se calcule correctamente, etc. El test de integración con Testcontainers levanta un PostgreSQL real en Docker y ejecuta un flujo completo de 14 pasos — desde el registro hasta la valoración — pasando por todas las capas reales: controlador, servicio, repositorio y base de datos. Detecta problemas que los unitarios no pueden: queries incorrectas, constraints violados, comportamiento de los ENUMs nativos."

### P12: ¿Cómo funciona el Docker multi-stage en tus Dockerfiles?

"Cada Dockerfile tiene dos etapas. En el backend: la primera etapa usa eclipse-temurin:21-jdk-alpine para compilar el JAR con Maven; la segunda copia solo el JAR a una imagen eclipse-temurin:21-jre-alpine sin herramientas de compilación. En el frontend: la primera etapa usa node:20-alpine para ejecutar ng build; la segunda copia los archivos estáticos generados a nginx:alpine. El resultado son imágenes de producción mucho más ligeras y seguras, ya que no incluyen herramientas de build innecesarias."

### P13: ¿Qué harías diferente si empezaras el proyecto de nuevo?

"Tres cosas principalmente. Primera, empezaría con PostGIS desde el principio para las búsquedas geoespaciales, en lugar de implementar Haversine manualmente. Segunda, añadiría más tests unitarios — actualmente hay 6, pero con más cobertura habría detectado algunos bugs antes. Y tercera, implementaría CI/CD con GitHub Actions desde el primer commit para automatizar la ejecución de tests y el análisis de código."

### P14: ¿Cómo garantizas que la aplicación cumple con el RGPD?

"De varias formas: las contraseñas se almacenan hasheadas con BCrypt, nunca en texto plano. Los perfiles públicos no muestran el email. No se transfieren datos a servicios de terceros: los mapas son OpenStreetMap (código abierto), el geocoding es Nominatim (gratuito y sin tracking), y no hay analíticas externas. El forgot-password no revela si un email existe en la base de datos. Todo se ejecuta en infraestructura propia con Docker, sin depender de clouds que puedan transferir datos fuera de la UE."

### P15: ¿Cómo escalarías MatchUp si tuviera miles de usuarios?

"La arquitectura ya está preparada para escalar. El backend es stateless — puedo añadir más instancias detrás de un balanceador de carga sin compartir estado. Migraría las búsquedas a PostGIS con índices GiST para soportar volumen. Añadiría Redis como caché para las consultas más frecuentes y para gestionar los refresh tokens (en lugar de PostgreSQL). Implementaría WebSocket para notificaciones en tiempo real, reduciendo el polling. Y para la base de datos, PostgreSQL soporta réplicas de lectura para distribuir la carga de consultas."
