package br.com.ignshipping.service;

import br.com.ignshipping.domain.entity.Pacote;
import br.com.ignshipping.dto.vendedor.DashboardVendedorResponse;
import br.com.ignshipping.dto.vendedor.PacoteResumoResponse;
import br.com.ignshipping.dto.vendedor.UsoPlanoPorcentagem;
import br.com.ignshipping.repository.CompradorRepository;
import br.com.ignshipping.repository.OrderItemRepository;
import br.com.ignshipping.repository.PacoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardVendedorService {

    private final OrderItemRepository orderItemRepository;
    private final PacoteRepository pacoteRepository;
    private final CompradorRepository compradorRepository;
    private final LimiteService limiteService;
    private final PacoteService pacoteService;

    public DashboardVendedorResponse getResumo(Long tenantId) {
        BigDecimal totalReceber = orderItemRepository.sumPendenteByTenantId(tenantId);
        long compradoresPendentes = orderItemRepository.countDistinctCompradoresComPendenteByTenantId(tenantId);
        BigDecimal lucroTotal = orderItemRepository.sumLucroByTenantId(tenantId);
        long totalPacotes = pacoteRepository.countByTenantId(tenantId);
        long totalCompradores = compradorRepository.countByTenantId(tenantId);

        BigDecimal ticketMedio = totalCompradores > 0
                ? totalReceber.divide(BigDecimal.valueOf(totalCompradores), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        UsoPlanoPorcentagem usoPlano = limiteService.getUsoAtual(tenantId);

        List<Pacote> recentes = pacoteRepository.findAllByTenantIdOrderByCriadoEmDesc(
                tenantId, PageRequest.of(0, 5));

        List<PacoteResumoResponse> pacotesRecentes = recentes.stream()
                .map(pacoteService::toPacoteResumoResponsePublic)
                .toList();

        return new DashboardVendedorResponse(
                totalReceber, compradoresPendentes, lucroTotal,
                totalPacotes, totalCompradores, ticketMedio,
                usoPlano, pacotesRecentes
        );
    }
}

