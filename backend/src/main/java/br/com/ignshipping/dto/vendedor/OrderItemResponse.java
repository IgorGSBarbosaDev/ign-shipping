package br.com.ignshipping.dto.vendedor;

import br.com.ignshipping.domain.enums.StatusPagamento;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long id,
        Long compradorId,
        String compradorNome,
        ProdutoResponse produto,
        Integer quantidade,
        BigDecimal precoVendaBrl,
        BigDecimal custoRateadoBrl,
        BigDecimal lucroItemBrl,
        Double proporcaoPeso,
        StatusPagamento statusPagamento
) {
}

