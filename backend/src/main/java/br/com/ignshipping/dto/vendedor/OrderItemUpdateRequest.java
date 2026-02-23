package br.com.ignshipping.dto.vendedor;

import br.com.ignshipping.domain.enums.StatusPagamento;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;

import java.math.BigDecimal;

public record OrderItemUpdateRequest(
        @Min(value = 1, message = "Quantidade mínima é 1")
        Integer quantidade,

        @DecimalMin(value = "0.01", message = "Preço de venda deve ser maior que zero")
        BigDecimal precoVendaBrl,

        StatusPagamento statusPagamento
) {
}

