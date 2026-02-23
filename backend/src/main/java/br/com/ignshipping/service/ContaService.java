package br.com.ignshipping.service;

import br.com.ignshipping.domain.entity.Plano;
import br.com.ignshipping.domain.entity.Tenant;
import br.com.ignshipping.dto.vendedor.ContaPlanoResponse;
import br.com.ignshipping.dto.vendedor.PlanoResponse;
import br.com.ignshipping.dto.vendedor.UsoPlanoPorcentagem;
import br.com.ignshipping.exception.ResourceNotFoundException;
import br.com.ignshipping.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContaService {

    private final TenantRepository tenantRepository;
    private final LimiteService limiteService;

    public ContaPlanoResponse getInfoPlano(Long tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant não encontrado: " + tenantId));

        Plano plano = tenant.getPlano();

        PlanoResponse planoResponse = new PlanoResponse(
                plano.getNome(),
                plano.getMaxPacotesMes(),
                plano.getMaxCompradores(),
                plano.getMaxProdutos(),
                plano.isPortalComprador(),
                plano.isExportacaoIncluida(),
                plano.getPrecoMensalBrl()
        );

        UsoPlanoPorcentagem uso = limiteService.getUsoAtual(tenantId);

        return new ContaPlanoResponse(planoResponse, uso);
    }
}

