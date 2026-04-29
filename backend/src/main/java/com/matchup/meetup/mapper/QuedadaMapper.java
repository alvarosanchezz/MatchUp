package com.matchup.meetup.mapper;

import com.matchup.comment.entity.Comentario;
import com.matchup.meetup.dto.*;
import com.matchup.meetup.entity.Quedada;
import com.matchup.participation.entity.EstadoAsistencia;
import com.matchup.participation.entity.UsuarioQuedada;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface QuedadaMapper {

    @Mapping(target = "idOrganizador",        source = "organizador.id")
    @Mapping(target = "nombreOrganizador",     source = "organizador.nombre")
    @Mapping(target = "idDeporte",             source = "deporte.id")
    @Mapping(target = "nombreDeporte",         source = "deporte.nombre")
    @Mapping(target = "numParticipantesActivos", expression = "java(contarActivos(q))")
    @Mapping(target = "participantes",         source = "participantes")
    @Mapping(target = "comentarios",           source = "comentarios")
    QuedadaDetailResponse toDetailResponse(Quedada q);

    @Mapping(target = "idOrganizador",        source = "organizador.id")
    @Mapping(target = "nombreOrganizador",     source = "organizador.nombre")
    @Mapping(target = "idDeporte",             source = "deporte.id")
    @Mapping(target = "nombreDeporte",         source = "deporte.nombre")
    @Mapping(target = "numParticipantesActivos", expression = "java(contarActivos(q))")
    QuedadaSummaryResponse toSummaryResponse(Quedada q);

    @Mapping(target = "idUsuario",     source = "usuario.id")
    @Mapping(target = "nombre",        source = "usuario.nombre")
    @Mapping(target = "urlFotoPerfil", source = "usuario.urlFotoPerfil")
    ParticipanteResponse toParticipanteResponse(UsuarioQuedada uq);

    @Mapping(target = "idUsuario",    source = "usuario.id")
    @Mapping(target = "nombreUsuario", source = "usuario.nombre")
    ComentarioSummaryResponse toComentarioResponse(Comentario c);

    default int contarActivos(Quedada q) {
        return (int) q.getParticipantes().stream()
                .filter(p -> p.getEstadoAsistencia() != EstadoAsistencia.RETIRADO)
                .count();
    }
}
