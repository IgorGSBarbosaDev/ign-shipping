package br.com.ignshipping.dto.vendedor;

import br.com.ignshipping.domain.enums.Categoria;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrcamentoResponse(
        Long id,
        LocalDateTime dataCriacao,
        String nomeProduto,
        Categoria categoria,
        BigDecimal custoYuan,
        BigDecimal freteVendedorYuan,
        BigDecimal freteInternacionalYuan,
        BigDecimal taxaCssbuyYuan,
        BigDecimal taxaAlfandegariaBrl,
        Integer pesoGramas,
        BigDecimal cambio,
        BigDecimal precoVendaBrl,
        BigDecimal custoTotalBrl,
        BigDecimal lucroBrl,
        BigDecimal margemPercentual,
        BigDecimal precoSugeridoMargem20,
        BigDecimal precoSugeridoMargem30
) {
}

