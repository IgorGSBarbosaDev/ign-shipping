package br.com.ignshipping.dto.vendedor;

public record UsoPlanoPorcentagem(
        long pacotesMesUsados,
        Integer pacotesMesLimite,
        long compradoresUsados,
        Integer compradoresLimite,
        long produtosUsados,
        Integer produtosLimite
) {
}

