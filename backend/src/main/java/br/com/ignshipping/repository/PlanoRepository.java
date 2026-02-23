package br.com.ignshipping.repository;

import br.com.ignshipping.domain.entity.Plano;
import br.com.ignshipping.domain.enums.NomePlano;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlanoRepository extends JpaRepository<Plano, Long> {

    Optional<Plano> findByNome(NomePlano nome);
}

