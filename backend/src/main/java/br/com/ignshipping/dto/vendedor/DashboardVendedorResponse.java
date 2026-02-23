package br.com.ignshipping.dto.vendedor;

import java.math.BigDecimal;
import java.util.List;

public record DashboardVendedorResponse(
        BigDecimal totalReceberBrl,
        long compradoresPendentes,
        BigDecimal lucroTotalBrl,
        long totalPacotes,
        long totalCompradoresUnicos,
        BigDecimal ticketMedioBrl,
        UsoPlanoPorcentagem usoPlano,
        List<PacoteResumoResponse> pacotesRecentes
) {
}

