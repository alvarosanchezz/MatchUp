package com.matchup.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDateTime;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@Testcontainers
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class FullFlowIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:16-alpine")
                    .withDatabaseName("matchup_test")
                    .withUsername("testuser")
                    .withPassword("testpass");

    @DynamicPropertySource
    static void configureDataSource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url",      postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    // ── Estado compartido entre métodos ordenados ───────────────────────────
    private static String anaToken;
    private static String carlosToken;
    private static Long   meetupId;
    private static Long   anaId;
    private static Long   carlosId;

    private static final String ANA_EMAIL    = "ana@flowtest.com";
    private static final String ANA_PASS     = "Password1!";
    private static final String CARLOS_EMAIL = "carlos@flowtest.com";
    private static final String CARLOS_PASS  = "Password1!";

    // ── 1. Registrar Ana ────────────────────────────────────────────────────

    @Test @Order(1)
    void t01_registrarAna() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nombre", "Ana",
                                "email", ANA_EMAIL,
                                "password", ANA_PASS))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.access_token").isNotEmpty());
    }

    // ── 2. Registrar Carlos ─────────────────────────────────────────────────

    @Test @Order(2)
    void t02_registrarCarlos() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "nombre", "Carlos",
                                "email", CARLOS_EMAIL,
                                "password", CARLOS_PASS))))
                .andExpect(status().isCreated());
    }

    // ── 3. Login Ana ────────────────────────────────────────────────────────

    @Test @Order(3)
    void t03_loginAna_devuelveToken() throws Exception {
        String body = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", ANA_EMAIL,
                                "password", ANA_PASS))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token").isNotEmpty())
                .andReturn().getResponse().getContentAsString();

        anaToken = objectMapper.readTree(body).get("access_token").asText();
    }

    // ── 4. Obtener ID de Ana ─────────────────────────────────────────────────

    @Test @Order(4)
    void t04_getMeAna_obtieneId() throws Exception {
        String body = mockMvc.perform(get("/api/v1/users/me")
                        .header("Authorization", "Bearer " + anaToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(ANA_EMAIL))
                .andReturn().getResponse().getContentAsString();

        anaId = objectMapper.readTree(body).get("id").asLong();
    }

    // ── 5. Ana crea la quedada ───────────────────────────────────────────────

    @Test @Order(5)
    void t05_anaCreaMeetup() throws Exception {
        LocalDateTime inicio = LocalDateTime.now().plusDays(30);
        LocalDateTime fin    = inicio.plusHours(2);

        String body = mockMvc.perform(post("/api/v1/meetups")
                        .header("Authorization", "Bearer " + anaToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "idDeporte", 1,
                                "fechaHoraInicio", inicio.toString(),
                                "fechaHoraFin", fin.toString(),
                                "ubicacionNombre", "Polideportivo Central",
                                "ubicacionLatitud", 40.4,
                                "ubicacionLongitud", -3.7,
                                "numJugadoresTotal", 10,
                                "esPublica", true,
                                "descripcion", "Partido de prueba"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estado").value("ABIERTA"))
                .andExpect(jsonPath("$.idOrganizador").value(anaId))
                .andReturn().getResponse().getContentAsString();

        meetupId = objectMapper.readTree(body).get("id").asLong();
    }

    // ── 6. Login Carlos ─────────────────────────────────────────────────────

    @Test @Order(6)
    void t06_loginCarlos_devuelveToken() throws Exception {
        String body = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", CARLOS_EMAIL,
                                "password", CARLOS_PASS))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        carlosToken = objectMapper.readTree(body).get("access_token").asText();
    }

    // ── 7. Obtener ID de Carlos ──────────────────────────────────────────────

    @Test @Order(7)
    void t07_getMeCarlos_obtieneId() throws Exception {
        String body = mockMvc.perform(get("/api/v1/users/me")
                        .header("Authorization", "Bearer " + carlosToken))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        carlosId = objectMapper.readTree(body).get("id").asLong();
    }

    // ── 8. Carlos lista quedadas — debe aparecer la creada por Ana ───────────

    @Test @Order(8)
    void t08_listarQuedadas_contieneQuedadaDeAna() throws Exception {
        mockMvc.perform(get("/api/v1/meetups")
                        .header("Authorization", "Bearer " + carlosToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.content[?(@.id == " + meetupId + ")]").exists());
    }

    // ── 9. Carlos se apunta ─────────────────────────────────────────────────

    @Test @Order(9)
    void t09_carlosSeApunta() throws Exception {
        mockMvc.perform(post("/api/v1/meetups/{id}/participations/join", meetupId)
                        .header("Authorization", "Bearer " + carlosToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoAsistencia").value("PENDIENTE"));
    }

    // ── 10. Ana finaliza la quedada ──────────────────────────────────────────

    @Test @Order(10)
    void t10_anaFinaliza() throws Exception {
        mockMvc.perform(post("/api/v1/meetups/{id}/finalize", meetupId)
                        .header("Authorization", "Bearer " + anaToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("FINALIZADA"));
    }

    // ── 11. Ana confirma asistencia de Carlos ────────────────────────────────

    @Test @Order(11)
    void t11_anaConfirmaAsistenciaDeCarlos() throws Exception {
        mockMvc.perform(post("/api/v1/meetups/{meetupId}/participations/{userId}/confirm",
                        meetupId, carlosId)
                        .header("Authorization", "Bearer " + anaToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoAsistencia").value("CONFIRMADO"));
    }

    // ── 12. Verificar fiabilidad de Carlos = 100 % ───────────────────────────

    @Test @Order(12)
    void t12_fiabilidadDeCarlosEs100() throws Exception {
        mockMvc.perform(get("/api/v1/users/{id}", carlosId)
                        .header("Authorization", "Bearer " + anaToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fiabilidadScore").value(100.0));
    }

    // ── 13. Carlos valora a Ana ─────────────────────────────────────────────

    @Test @Order(13)
    void t13_carlosValoraAna() throws Exception {
        mockMvc.perform(post("/api/v1/meetups/{id}/ratings", meetupId)
                        .header("Authorization", "Bearer " + carlosToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "idValorado",      anaId,
                                "nivelNota",       5,
                                "deportividadNota", 5))))
                .andExpect(status().isCreated());
    }

    // ── 14. Ana lista sus ratings recibidos ──────────────────────────────────

    @Test @Order(14)
    void t14_anaListaRatingsRecibidos() throws Exception {
        mockMvc.perform(get("/api/v1/meetups/{id}/ratings/received", meetupId)
                        .header("Authorization", "Bearer " + anaToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nivelNota").value(5))
                .andExpect(jsonPath("$[0].deportividadNota").value(5));
    }
}
