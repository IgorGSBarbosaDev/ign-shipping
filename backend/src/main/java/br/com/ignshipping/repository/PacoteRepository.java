package br.com.ignshipping.repository;

import br.com.ignshipping.domain.entity.Pacote;
import br.com.ignshipping.domain.enums.StatusPacote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;

public interface PacoteRepository extends JpaRepository<Pacote, Long> {

    List<Pacote> findAllByTenantId(Long tenantId);

    List<Pacote> findAllByTenantIdAndStatus(Long tenantId, StatusPacote status);

    long countByTenantIdAndCriadoEmBetween(Long tenantId, LocalDateTime inicio, LocalDateTime fim);

    long countByTenantId(Long tenantId);

    Optional<Pacote> findByIdAndTenantId(Long id, Long tenantId);

    List<Pacote> findAllByTenantIdOrderByCriadoEmDesc(Long tenantId, Pageable pageable);

    @Query("SELECT p FROM Pacote p LEFT JOIN FETCH p.itens i LEFT JOIN FETCH i.produto " +
           "WHERE p.id = :id AND p.tenant.id = :tenantId")
    Optional<Pacote> findByIdWithItens(@Param("id") Long id, @Param("tenantId") Long tenantId);

    @Query("SELECT DISTINCT p FROM Pacote p " +
           "LEFT JOIN FETCH p.itens i " +
           "LEFT JOIN FETCH i.produto " +
           "LEFT JOIN FETCH i.comprador " +
           "WHERE p.id = :id AND p.tenant.id = :tenantId")
    Optional<Pacote> findByIdAndTenantIdWithItens(@Param("id") Long id, @Param("tenantId") Long tenantId);
}

