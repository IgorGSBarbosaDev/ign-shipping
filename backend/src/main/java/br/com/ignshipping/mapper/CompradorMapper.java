package br.com.ignshipping.mapper;

import br.com.ignshipping.domain.entity.Comprador;
import br.com.ignshipping.dto.vendedor.CompradorRequest;
import br.com.ignshipping.dto.vendedor.CompradorResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CompradorMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tenant", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "codigoConvite", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    Comprador toEntity(CompradorRequest request);

    @Mapping(target = "totalPedidos", constant = "0")
    @Mapping(target = "totalGastoBrl", expression = "java(java.math.BigDecimal.ZERO)")
    @Mapping(target = "totalPendenteBrl", expression = "java(java.math.BigDecimal.ZERO)")
    @Mapping(target = "lucroGeradoBrl", expression = "java(java.math.BigDecimal.ZERO)")
    @Mapping(target = "codigoConvitePortal", source = "codigoConvite")
    CompradorResponse toResponse(Comprador comprador);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tenant", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "codigoConvite", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    void updateFromRequest(CompradorRequest request, @MappingTarget Comprador comprador);
}

