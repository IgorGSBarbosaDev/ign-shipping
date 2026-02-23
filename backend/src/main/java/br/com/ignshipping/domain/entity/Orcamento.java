package br.com.ignshipping.domain.entity;

import br.com.ignshipping.domain.enums.Categoria;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orcamentos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Orcamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "nome_produto", nullable = false, length = 150)
    private String nomeProduto;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Categoria categoria;

    @Column(name = "custo_yuan", nullable = false, precision = 10, scale = 2)
    private BigDecimal custoYuan;

    @Column(name = "frete_vendedor_yuan", nullable = false, precision = 10, scale = 2)
    private BigDecimal freteVendedorYuan;

    @Column(name = "frete_internacional_yuan", nullable = false, precision = 10, scale = 2)
    private BigDecimal freteInternacionalYuan;

    @Column(name = "taxa_cssbuy_yuan", nullable = false, precision = 10, scale = 2)
    private BigDecimal taxaCssbuyYuan;

    @Column(name = "taxa_alfandegaria_brl", nullable = false, precision = 10, scale = 2)
    private BigDecimal taxaAlfandegariaBrl;

    @Column(name = "peso_gramas", nullable = false)
    private Integer pesoGramas;

    @Column(nullable = false, precision = 8, scale = 4)
    private BigDecimal cambio;

    @Column(name = "preco_venda_brl", precision = 10, scale = 2)
    private BigDecimal precoVendaBrl;

    @Column(name = "custo_total_brl", precision = 10, scale = 2)
    private BigDecimal custoTotalBrl;

    @Column(name = "lucro_brl", precision = 10, scale = 2)
    private BigDecimal lucroBrl;

    @Column(name = "margem_percentual", precision = 6, scale = 2)
    private BigDecimal margemPercentual;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;
}

