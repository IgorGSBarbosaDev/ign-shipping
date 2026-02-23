package br.com.ignshipping.dto.vendedor;

import br.com.ignshipping.domain.enums.StatusPacote;
import br.com.ignshipping.domain.enums.TipoEnvio;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PacoteResumoResponse(
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
        LocalDate dataEnvio
) {
}

