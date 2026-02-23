package br.com.ignshipping.dto.vendedor;

import java.math.BigDecimal;
import java.util.List;

public record ResumoFinanceiroResponse(
        Long pacoteId,
        BigDecimal cambioUtilizado,
        BigDecimal custoTotalYuan,
        BigDecimal custoTotalBrl,
        BigDecimal receitaTotalBrl,
        BigDecimal lucroBrl,
        BigDecimal margemPercentual,
        BigDecimal freteInternacionalYuan,
        BigDecimal freteInternacionalBrl,
        BigDecimal taxaCssbuyYuan,
        BigDecimal taxaCssbuyBrl,
        BigDecimal taxaAlfandegariaBrl,
        List<ItensPorCompradorResponse> compradores
) {
}

