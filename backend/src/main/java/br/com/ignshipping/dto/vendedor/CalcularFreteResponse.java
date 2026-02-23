package br.com.ignshipping.dto.vendedor;

import java.math.BigDecimal;

public record CalcularFreteResponse(
        BigDecimal custoYuan,
        FaixaFreteResponse faixaAplicada
) {
}

