package br.com.ignshipping.dto.vendedor;

import br.com.ignshipping.domain.enums.TipoEnvio;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CalcularFreteRequest(
        @NotNull(message = "Tipo de envio é obrigatório")
        TipoEnvio tipoEnvio,

        @NotNull(message = "Peso é obrigatório")
        @Min(value = 1, message = "Peso deve ser >= 1 grama")
        Integer pesoGramas
) {
}

