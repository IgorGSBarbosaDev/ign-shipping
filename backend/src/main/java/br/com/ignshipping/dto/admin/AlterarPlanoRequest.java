package br.com.ignshipping.dto.admin;

import br.com.ignshipping.domain.enums.NomePlano;
import jakarta.validation.constraints.NotNull;

public record AlterarPlanoRequest(
        @NotNull(message = "Plano é obrigatório")
        NomePlano plano
) {
}

