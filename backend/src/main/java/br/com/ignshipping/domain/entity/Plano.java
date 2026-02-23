package br.com.ignshipping.domain.entity;

import br.com.ignshipping.domain.enums.NomePlano;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "planos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Plano {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 20)
    private NomePlano nome;

    @Column(name = "max_pacotes_mes")
    private Integer maxPacotesMes;

    @Column(name = "max_compradores")
    private Integer maxCompradores;

    @Column(name = "max_produtos")
    private Integer maxProdutos;

    @Column(name = "portal_comprador", nullable = false)
    private boolean portalComprador;

    @Column(name = "exportacao_incluida", nullable = false)
    private boolean exportacaoIncluida;

    @Column(name = "preco_mensal_brl", nullable = false, precision = 8, scale = 2)
    private BigDecimal precoMensalBrl;
}

