package br.com.ignshipping.dto.vendedor;

import java.math.BigDecimal;
import java.util.List;

public record ItensPorCompradorResponse(
        Long compradorId,
        String compradorNome,
        Integer totalItens,
        Integer pesoTotalGramas,
        BigDecimal subtotalCustoBrl,
        BigDecimal subtotalVendaBrl,
        BigDecimal lucroBrl,
        BigDecimal margemPercentual,
        BigDecimal totalPendenteBrl,
        List<OrderItemResponse> itens
) {
}

