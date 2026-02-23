package br.com.ignshipping.dto.vendedor;

import br.com.ignshipping.domain.enums.StatusPacote;
import br.com.ignshipping.domain.enums.TipoEnvio;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record PacoteDetalheResponse(
        Long id,
        String nome,
        StatusPacote status,
        TipoEnvio tipoEnvio,
        Integer pesoTotalGramas,
        BigDecimal custoTotalBrl,
        BigDecimal receitaTotalBrl,
        BigDecimal margemPercentual,
        Integer totalCompradores,
        Integer totalItens,
        BigDecimal cambio,
        LocalDateTime dataCriacao,
        LocalDate dataEnvio,
        BigDecimal taxaCssbuyYuan,
        BigDecimal freteInternacionalYuan,
        BigDecimal freteInternacionalBrl,
        BigDecimal taxaAlfandegariaBrl,
        List<ItensPorCompradorResponse> itensPorComprador,
        String observacoes
) {
}

