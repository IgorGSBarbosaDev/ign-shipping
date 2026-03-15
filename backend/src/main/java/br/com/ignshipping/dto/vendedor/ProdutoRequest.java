package br.com.ignshipping.dto.vendedor;

import br.com.ignshipping.domain.enums.Categoria;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ProdutoRequest(
        @NotBlank(message = "Nome é obrigatório")
        @Size(min = 2, max = 150, message = "Nome deve ter entre 2 e 150 caracteres")
        String nome,

        @NotNull(message = "Categoria é obrigatória")
        Categoria categoria,

        @NotNull(message = "Custo em yuan é obrigatório")
        @DecimalMin(value = "0.01", message = "Custo deve ser maior que zero")
        BigDecimal custoYuan,

        @NotNull(message = "Custo de compra em yuan é obrigatório")
        @DecimalMin(value = "0", message = "Custo de compra não pode ser negativo")
        BigDecimal custoCompraYuan,

        @DecimalMin(value = "0", message = "Frete do vendedor não pode ser negativo")
        BigDecimal freteVendedorYuan,

        @NotNull(message = "Peso em gramas é obrigatório")
        @Min(value = 1, message = "Peso deve ser no mínimo 1 grama")
        Integer pesoGramas,

        String descricao,

        String fotoUrl
) {
}

