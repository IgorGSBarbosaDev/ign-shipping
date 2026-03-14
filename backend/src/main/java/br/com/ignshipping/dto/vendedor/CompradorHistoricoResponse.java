package br.com.ignshipping.dto.vendedor;

import br.com.ignshipping.dto.portal.PedidoCompradorResponse;

import java.math.BigDecimal;
import java.util.List;

public record CompradorHistoricoResponse(
        CompradorResponse comprador,
        Integer totalPedidos,
        BigDecimal totalPagoBrl,
        BigDecimal totalPendenteBrl,
        List<PedidoCompradorResponse> pedidos
) {
}
