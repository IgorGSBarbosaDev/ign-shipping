package br.com.ignshipping.dto.portal;

import br.com.ignshipping.domain.enums.StatusPacote;
import br.com.ignshipping.domain.enums.StatusPagamento;
import br.com.ignshipping.dto.vendedor.ProdutoResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PedidoCompradorResponse(
        Long itemId,
        ProdutoResponse produto,
        Integer quantidade,
        BigDecimal precoVendaBrl,
        StatusPacote statusPacote,
        StatusPagamento statusPagamento,
        LocalDateTime dataPacote,
        String nomeVendedor
) {
}

