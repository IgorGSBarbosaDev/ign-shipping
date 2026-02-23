package br.com.ignshipping.repository;

import br.com.ignshipping.domain.entity.Orcamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrcamentoRepository extends JpaRepository<Orcamento, Long> {

    List<Orcamento> findAllByTenantId(Long tenantId);

    List<Orcamento> findAllByTenantIdOrderByCriadoEmDesc(Long tenantId);
}

