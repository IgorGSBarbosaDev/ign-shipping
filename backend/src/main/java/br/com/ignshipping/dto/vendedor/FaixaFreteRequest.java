package br.com.ignshipping.dto.vendedor;

import br.com.ignshipping.domain.enums.TipoEnvio;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record FaixaFreteRequest(
        @NotNull(message = "Tipo de envio é obrigatório")
        TipoEnvio tipoEnvio,

        @NotNull(message = "Peso mínimo é obrigatório")
        @Min(value = 0, message = "Peso mínimo deve ser >= 0")
        Integer pesoMinGramas,

        @NotNull(message = "Peso máximo é obrigatório")
        @Min(value = 1, message = "Peso máximo deve ser >= 1")
        Integer pesoMaxGramas,

        @NotNull(message = "Custo em yuan é obrigatório")
        @DecimalMin(value = "0.01", message = "Custo deve ser maior que zero")
        BigDecimal custoYuan
) {
}

