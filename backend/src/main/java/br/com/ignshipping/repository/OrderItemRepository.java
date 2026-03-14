package br.com.ignshipping.repository;

import br.com.ignshipping.domain.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findAllByPacoteId(Long pacoteId);

    List<OrderItem> findAllByCompradorId(Long compradorId);

    List<OrderItem> findAllByCompradorIdAndTenantIdOrderByPacoteCriadoEmDescCriadoEmDesc(Long compradorId, Long tenantId);

    boolean existsByCompradorId(Long compradorId);

    boolean existsByProdutoId(Long produtoId);

    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.comprador.id = :compradorId")
    int countByCompradorId(@Param("compradorId") Long compradorId);

    @Query("SELECT COALESCE(SUM(oi.precoVendaBrl), 0) FROM OrderItem oi WHERE oi.comprador.id = :compradorId")
    BigDecimal sumPrecoVendaByCompradorId(@Param("compradorId") Long compradorId);

    @Query("SELECT COALESCE(SUM(oi.precoVendaBrl), 0) FROM OrderItem oi WHERE oi.comprador.id = :compradorId AND oi.statusPagamento = br.com.ignshipping.domain.enums.StatusPagamento.PENDENTE")
    BigDecimal sumPendenteByCompradorId(@Param("compradorId") Long compradorId);

    @Query("SELECT COALESCE(SUM(oi.precoVendaBrl - oi.custoRateadoBrl), 0) FROM OrderItem oi WHERE oi.comprador.id = :compradorId AND oi.custoRateadoBrl IS NOT NULL")
    BigDecimal sumLucroByCompradorId(@Param("compradorId") Long compradorId);

    // ── Dashboard queries (tenant-level) ───────────────────────

    @Query("SELECT COALESCE(SUM(oi.precoVendaBrl), 0) FROM OrderItem oi WHERE oi.tenant.id = :tenantId AND oi.statusPagamento = br.com.ignshipping.domain.enums.StatusPagamento.PENDENTE")
    BigDecimal sumPendenteByTenantId(@Param("tenantId") Long tenantId);

    @Query("SELECT COUNT(DISTINCT oi.comprador.id) FROM OrderItem oi WHERE oi.tenant.id = :tenantId AND oi.statusPagamento = br.com.ignshipping.domain.enums.StatusPagamento.PENDENTE")
    long countDistinctCompradoresComPendenteByTenantId(@Param("tenantId") Long tenantId);

    @Query("SELECT COALESCE(SUM(oi.precoVendaBrl - oi.custoRateadoBrl), 0) FROM OrderItem oi WHERE oi.tenant.id = :tenantId AND oi.custoRateadoBrl IS NOT NULL")
    BigDecimal sumLucroByTenantId(@Param("tenantId") Long tenantId);
}

