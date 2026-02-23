package br.com.ignshipping.domain.entity;

import br.com.ignshipping.domain.enums.TipoEnvio;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "faixas_frete")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FaixaFrete {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_envio", nullable = false, length = 15)
    private TipoEnvio tipoEnvio;

    @Column(name = "peso_min_gramas", nullable = false)
    private Integer pesoMinGramas;

    @Column(name = "peso_max_gramas", nullable = false)
    private Integer pesoMaxGramas;

    @Column(name = "custo_yuan", nullable = false, precision = 10, scale = 2)
    private BigDecimal custoYuan;
}

