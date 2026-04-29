package com.matchup.sport.mapper;

import com.matchup.sport.dto.DeporteResponse;
import com.matchup.sport.entity.Deporte;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DeporteMapper {
    DeporteResponse toResponse(Deporte deporte);
}
