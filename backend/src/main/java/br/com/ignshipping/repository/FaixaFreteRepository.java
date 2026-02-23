package br.com.ignshipping.repository;

import br.com.ignshipping.domain.entity.FaixaFrete;
import br.com.ignshipping.domain.enums.TipoEnvio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FaixaFreteRepository extends JpaRepository<FaixaFrete, Long> {

    List<FaixaFrete> findAllByTenantId(Long tenantId);

    List<FaixaFrete> findAllByTenantIdOrderByTipoEnvioAscPesoMinGramasAsc(Long tenantId);

    Optional<FaixaFrete> findByTenantIdAndTipoEnvioAndPesoMinGramasLessThanEqualAndPesoMaxGramasGreaterThanEqual(
            Long tenantId, TipoEnvio tipoEnvio, Integer peso, Integer peso2);

    @Query("SELECT COUNT(f) > 0 FROM FaixaFrete f WHERE f.tenant.id = :tenantId " +
           "AND f.tipoEnvio = :tipoEnvio " +
           "AND f.pesoMinGramas < :pesoMax AND f.pesoMaxGramas > :pesoMin")
    boolean existsOverlapping(@Param("tenantId") Long tenantId,
                              @Param("tipoEnvio") TipoEnvio tipoEnvio,
                              @Param("pesoMin") Integer pesoMin,
                              @Param("pesoMax") Integer pesoMax);
}

