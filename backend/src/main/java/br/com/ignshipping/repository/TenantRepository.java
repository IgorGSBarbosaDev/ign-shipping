package br.com.ignshipping.repository;

import br.com.ignshipping.domain.entity.Tenant;
import br.com.ignshipping.domain.enums.NomePlano;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface TenantRepository extends JpaRepository<Tenant, Long> {

    long countByStatusConta(String statusConta);

    long countByCriadoEmAfter(LocalDateTime data);

    @Query("SELECT COUNT(t) FROM Tenant t WHERE t.statusConta = 'ATIVO' AND t.plano.precoMensalBrl > 0")
    long countTenantsPagantes();

    @Query("SELECT COALESCE(SUM(t.plano.precoMensalBrl), 0) FROM Tenant t WHERE t.statusConta = 'ATIVO' AND t.plano.precoMensalBrl > 0")
    BigDecimal sumMrr();

    List<Tenant> findAllByPlanoNome(NomePlano plano);

    List<Tenant> findAllByStatusConta(String statusConta);

    List<Tenant> findAllByPlanoNomeAndStatusConta(NomePlano plano, String statusConta);
}

