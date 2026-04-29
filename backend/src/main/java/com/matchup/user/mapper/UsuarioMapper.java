package com.matchup.user.mapper;

import com.matchup.user.dto.UsuarioPreferenciaResponse;
import com.matchup.user.dto.UsuarioPublicResponse;
import com.matchup.user.dto.UsuarioResponse;
import com.matchup.user.entity.Usuario;
import com.matchup.user.entity.UsuarioDeporte;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

    @Mapping(target = "deportes", source = "deportes")
    UsuarioResponse toResponse(Usuario usuario);

    @Mapping(target = "deportes", source = "deportes")
    UsuarioPublicResponse toPublicResponse(Usuario usuario);

    @Mapping(target = "idDeporte", source = "deporte.id")
    @Mapping(target = "nombreDeporte", source = "deporte.nombre")
    @Mapping(target = "nivel", source = "nivelAutoevaluado")
    @Mapping(target = "rolPreferido", source = "rolPreferido")
    UsuarioPreferenciaResponse toPreferenciaResponse(UsuarioDeporte ud);
}
