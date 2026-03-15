package br.com.ignshipping.dto.vendedor;

import br.com.ignshipping.domain.enums.Categoria;

import java.math.BigDecimal;

public record ProdutoResponse(
        Long id,
        String nome,
        Categoria categoria,
        BigDecimal custoYuan,
        BigDecimal custoCompraYuan,
        BigDecimal freteVendedorYuan,
        Integer pesoGramas,
        String descricao,
        String fotoUrl
) {
}

