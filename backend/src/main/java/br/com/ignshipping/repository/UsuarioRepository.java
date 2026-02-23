package br.com.ignshipping.repository;

import br.com.ignshipping.domain.entity.Usuario;
import br.com.ignshipping.domain.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<Usuario> findFirstByTenantIdAndRole(Long tenantId, Role role);

    List<Usuario> findAllByTenantId(Long tenantId);
}

