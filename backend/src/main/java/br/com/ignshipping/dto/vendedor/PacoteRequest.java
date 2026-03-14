package br.com.ignshipping.dto.vendedor;

import br.com.ignshipping.domain.enums.TipoEnvio;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PacoteRequest(
        @NotBlank(message = "Nome é obrigatório")
        @Size(min = 2, max = 150, message = "Nome deve ter entre 2 e 150 caracteres")
        String nome,

        TipoEnvio tipoEnvio,

        @DecimalMin(value = "0.001", message = "Câmbio (CNY por BRL) deve ser maior que zero")
        BigDecimal cambio,

        @DecimalMin(value = "0", message = "Taxa alfandegária não pode ser negativa")
        BigDecimal taxaAlfandegariaBrl,

        LocalDate dataEnvio,

        String observacoes
) {
}

