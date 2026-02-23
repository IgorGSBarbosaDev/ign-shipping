package br.com.ignshipping.dto.vendedor;

import br.com.ignshipping.domain.enums.StatusPacote;
import jakarta.validation.constraints.NotNull;

public record AtualizarStatusRequest(
        @NotNull(message = "Status é obrigatório")
        StatusPacote status
) {
}

