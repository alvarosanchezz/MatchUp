package com.matchup.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    private static final String SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Desarrollo local")
                ))
                // Aplica JWT a todos los endpoints por defecto
                .addSecurityItem(new SecurityRequirement().addList(SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SCHEME_NAME, jwtSecurityScheme()));
    }

    private Info apiInfo() {
        return new Info()
                .title("MatchUp API")
                .description("""
                        Backend de **MatchUp** — plataforma para organizar quedadas deportivas.

                        ## Autenticación
                        1. Llama a `POST /api/v1/auth/register` o `/login` para obtener el `access_token`.
                        2. Pulsa el botón **Authorize** e introduce `<tu_access_token>` (sin "Bearer ").
                        3. Springdoc añade el header `Authorization: Bearer <token>` en cada petición.
                        """)
                .version("1.0.0")
                .contact(new Contact()
                        .name("MatchUp Dev Team")
                        .email("dev@matchup.com"));
    }

    private SecurityScheme jwtSecurityScheme() {
        return new SecurityScheme()
                .name(SCHEME_NAME)
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("Access token JWT obtenido en /api/v1/auth/login (expira en 15 min)");
    }
}
