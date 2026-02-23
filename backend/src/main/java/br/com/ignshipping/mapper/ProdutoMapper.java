package br.com.ignshipping.mapper;

import br.com.ignshipping.domain.entity.Produto;
import br.com.ignshipping.dto.vendedor.ProdutoRequest;
import br.com.ignshipping.dto.vendedor.ProdutoResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProdutoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tenant", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    Produto toEntity(ProdutoRequest request);

    ProdutoResponse toResponse(Produto produto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tenant", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    void updateFromRequest(ProdutoRequest request, @MappingTarget Produto produto);
}

