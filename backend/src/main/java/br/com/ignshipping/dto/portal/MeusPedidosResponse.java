package br.com.ignshipping.dto.portal;

import java.math.BigDecimal;
import java.util.List;

public record MeusPedidosResponse(
        int totalPedidos,
        BigDecimal totalPagoBrl,
        BigDecimal totalPendenteBrl,
        List<PedidoCompradorResponse> pedidos
) {
}

