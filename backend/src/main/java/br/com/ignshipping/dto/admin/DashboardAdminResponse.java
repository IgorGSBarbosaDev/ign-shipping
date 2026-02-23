package br.com.ignshipping.dto.admin;

import java.math.BigDecimal;

public record DashboardAdminResponse(
        long totalTenants,
        long tenantsPagantes,
        BigDecimal mrrBrl,
        long novosCadastros30Dias,
        long totalCompradores,
        long totalPacotesPlataforma
) {
}

