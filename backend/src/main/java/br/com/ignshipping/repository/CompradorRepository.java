package br.com.ignshipping.repository;

import br.com.ignshipping.domain.entity.Comprador;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompradorRepository extends JpaRepository<Comprador, Long> {

    List<Comprador> findAllByTenantId(Long tenantId);

    List<Comprador> findAllByTenantIdOrderByNomeAsc(Long tenantId);

    Optional<Comprador> findByCodigoConvite(String codigo);

    Optional<Comprador> findByUsuarioId(Long usuarioId);

    long countByTenantId(Long tenantId);
}

