package br.com.ignshipping.dto.vendedor;

public record ContaPlanoResponse(
        PlanoResponse plano,
        UsoPlanoPorcentagem uso
) {
}

