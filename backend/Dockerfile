# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copiar wrapper y POM primero para aprovechar la caché de capas
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -q

COPY src/ src/
RUN ./mvnw package -DskipTests -q

# ── Stage 2: runtime ────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# wget para healthcheck + usuario no-root
RUN apk add --no-cache wget \
    && addgroup -S matchup \
    && adduser -S matchup -G matchup

COPY --from=build /app/target/matchup-backend-0.0.1-SNAPSHOT.jar app.jar
RUN chown matchup:matchup app.jar

USER matchup
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
