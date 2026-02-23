package br.com.ignshipping.domain.entity;

import br.com.ignshipping.domain.enums.StatusPacote;
import br.com.ignshipping.domain.enums.TipoEnvio;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pacotes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Pacote {

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
    private StatusPacote status;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_envio", length = 15)
    private TipoEnvio tipoEnvio;

    @Column(precision = 8, scale = 4)
    private BigDecimal cambio;

    @Column(name = "taxa_alfandegaria_brl", nullable = false, precision = 10, scale = 2)
    private BigDecimal taxaAlfandegariaBrl;

    @Column(name = "frete_internacional_yuan", precision = 10, scale = 2)
    private BigDecimal freteInternacionalYuan;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "data_envio")
    private LocalDate dataEnvio;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    @OneToMany(mappedBy = "pacote", cascade = CascadeType.ALL)
    @Builder.Default
    private List<OrderItem> itens = new ArrayList<>();
}

