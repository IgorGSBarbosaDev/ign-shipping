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
@Table(name = "produtos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false, length = 150)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Categoria categoria;

    @Column(name = "custo_yuan", nullable = false, precision = 10, scale = 2)
    private BigDecimal custoYuan;

    @Column(name = "custo_compra_yuan", nullable = false, precision = 10, scale = 2)
    private BigDecimal custoCompraYuan;

    @Column(name = "frete_vendedor_yuan", nullable = false, precision = 10, scale = 2)
    private BigDecimal freteVendedorYuan;

    @Column(name = "peso_gramas", nullable = false)
    private Integer pesoGramas;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "foto_url", columnDefinition = "TEXT")
    private String fotoUrl;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;
}

