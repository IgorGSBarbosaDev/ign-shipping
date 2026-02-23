package br.com.ignshipping.dto.vendedor;

import br.com.ignshipping.domain.enums.TipoEnvio;

import java.math.BigDecimal;

public record FaixaFreteResponse(
        Long id,
        TipoEnvio tipoEnvio,
        Integer pesoMinGramas,
        Integer pesoMaxGramas,
        BigDecimal custoYuan
) {
}

