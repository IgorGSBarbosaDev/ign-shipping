package br.com.ignshipping.dto.vendedor;

import br.com.ignshipping.domain.enums.Categoria;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record OrcamentoRequest(
        @NotBlank(message = "Nome do produto é obrigatório")
        String nomeProduto,

        Categoria categoria,

        @NotNull(message = "Custo em yuan é obrigatório")
        @DecimalMin(value = "0.01", message = "Custo deve ser maior que zero")
        BigDecimal custoYuan,

        BigDecimal freteVendedorYuan,

        BigDecimal freteInternacionalYuan,

        BigDecimal taxaCssbuyYuan,

        BigDecimal taxaAlfandegariaBrl,

        @NotNull(message = "Peso é obrigatório")
        @Min(value = 1, message = "Peso deve ser >= 1 grama")
        Integer pesoGramas,

        @NotNull(message = "Câmbio é obrigatório")
        @DecimalMin(value = "0.001", message = "Câmbio deve ser maior que zero")
        BigDecimal cambio,

        BigDecimal precoVendaBrl
) {
}

