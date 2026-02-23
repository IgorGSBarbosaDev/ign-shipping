package br.com.ignshipping.dto.vendedor;

import java.math.BigDecimal;

public record CompradorResponse(
        Long id,
        String nome,
        String email,
        String telefone,
        Integer totalPedidos,
        BigDecimal totalGastoBrl,
        BigDecimal totalPendenteBrl,
        BigDecimal lucroGeradoBrl,
        String codigoConvitePortal
) {
}

