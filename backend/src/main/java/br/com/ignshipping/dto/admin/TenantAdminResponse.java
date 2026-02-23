package br.com.ignshipping.dto.admin;

import br.com.ignshipping.domain.enums.NomePlano;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TenantAdminResponse(
        Long id,
        String nomeVendedor,
        String email,
        NomePlano plano,
        String statusConta,
        LocalDateTime dataCadastro,
        LocalDateTime ultimoAcesso,
        long totalPacotes,
        long totalCompradores,
        BigDecimal mrrBrl
) {
}

