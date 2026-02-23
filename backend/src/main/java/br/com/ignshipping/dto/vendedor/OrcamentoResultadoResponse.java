package br.com.ignshipping.dto.vendedor;

import java.math.BigDecimal;

public record OrcamentoResultadoResponse(
        BigDecimal custoProdutoBrl,
        BigDecimal custoFreteVendedorBrl,
        BigDecimal custoFreteInternacionalBrl,
        BigDecimal custoCssbuyBrl,
        BigDecimal taxaAlfandegariaBrl,
        BigDecimal custoTotalBrl,
        BigDecimal precoVendaBrl,
        BigDecimal lucroBrl,
        BigDecimal margemPercentual,
        BigDecimal precoSugeridoMargem20,
        BigDecimal precoSugeridoMargem30
) {
}

