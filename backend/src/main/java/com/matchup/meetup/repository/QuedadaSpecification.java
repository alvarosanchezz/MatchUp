package com.matchup.meetup.repository;

import com.matchup.meetup.entity.EstadoQuedada;
import com.matchup.meetup.entity.Quedada;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class QuedadaSpecification {

    private QuedadaSpecification() {}

    public static Specification<Quedada> conFiltros(
            Long idDeporte,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta,
            EstadoQuedada estado,
            Double lat,
            Double lon,
            Double radioKm) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (idDeporte != null) {
                predicates.add(cb.equal(root.get("deporte").get("id"), idDeporte));
            }
            if (fechaDesde != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("fechaHoraInicio"), fechaDesde));
            }
            if (fechaHasta != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("fechaHoraInicio"), fechaHasta));
            }
            if (estado != null) {
                predicates.add(cb.equal(root.get("estado"), estado));
            } else {
                // Por defecto excluir quedadas canceladas y finalizadas del listado público
                predicates.add(cb.not(root.get("estado").in(
                        EstadoQuedada.CANCELADA, EstadoQuedada.FINALIZADA)));
            }
            if (lat != null && lon != null && radioKm != null) {
                predicates.add(haversine(cb, root.get("ubicacionLatitud"),
                        root.get("ubicacionLongitud"), lat, lon, radioKm));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Haversine filter: 6371 * acos(
     *   cos(radians(lat)) * cos(radians(q.lat)) * cos(radians(q.lon) - radians(lon))
     *   + sin(radians(lat)) * sin(radians(q.lat))
     * ) <= radioKm
     */
    private static Predicate haversine(
            jakarta.persistence.criteria.CriteriaBuilder cb,
            Expression<Double> qLat,
            Expression<Double> qLon,
            double lat, double lon, double radioKm) {

        Expression<Double> pLatRad = cb.function("radians", Double.class, cb.literal(lat));
        Expression<Double> pLonRad = cb.function("radians", Double.class, cb.literal(lon));
        Expression<Double> qLatRad = cb.function("radians", Double.class, qLat);
        Expression<Double> qLonRad = cb.function("radians", Double.class, qLon);

        Expression<Double> cosProduct = cb.prod(
                cb.prod(
                        cb.function("cos", Double.class, pLatRad),
                        cb.function("cos", Double.class, qLatRad)
                ),
                cb.function("cos", Double.class, cb.diff(qLonRad, pLonRad))
        );
        Expression<Double> sinProduct = cb.prod(
                cb.function("sin", Double.class, pLatRad),
                cb.function("sin", Double.class, qLatRad)
        );

        Expression<Double> distancia = cb.prod(
                cb.literal(6371.0),
                cb.function("acos", Double.class, cb.sum(cosProduct, sinProduct))
        );

        return cb.lessThanOrEqualTo(distancia, radioKm);
    }
}
