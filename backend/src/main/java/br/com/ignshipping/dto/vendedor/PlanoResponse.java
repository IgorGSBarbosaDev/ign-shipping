package br.com.ignshipping.dto.vendedor;

import br.com.ignshipping.domain.enums.NomePlano;

import java.math.BigDecimal;

public record PlanoResponse(
        NomePlano nome,
        Integer maxPacotesMes,
        Integer maxCompradores,
        Integer maxProdutos,
        boolean portalCompradorIncluido,
        boolean exportacaoIncluida,
        BigDecimal precoMensalBrl
) {
}

