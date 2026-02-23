package br.com.ignshipping.repository;

import br.com.ignshipping.domain.entity.Produto;
import br.com.ignshipping.domain.enums.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    List<Produto> findAllByTenantId(Long tenantId);

    List<Produto> findAllByTenantIdAndCategoria(Long tenantId, Categoria categoria);

    long countByTenantId(Long tenantId);
}

