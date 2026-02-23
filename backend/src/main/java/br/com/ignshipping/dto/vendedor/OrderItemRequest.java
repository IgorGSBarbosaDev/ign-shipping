package br.com.ignshipping.dto.vendedor;

import br.com.ignshipping.domain.enums.StatusPagamento;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record OrderItemRequest(
        @NotNull(message = "Comprador é obrigatório")
        Long compradorId,

        @NotNull(message = "Produto é obrigatório")
        Long produtoId,

        @Min(value = 1, message = "Quantidade mínima é 1")
        Integer quantidade,

        @NotNull(message = "Preço de venda é obrigatório")
        @DecimalMin(value = "0.01", message = "Preço de venda deve ser maior que zero")
        BigDecimal precoVendaBrl,

        StatusPagamento statusPagamento
) {
}

