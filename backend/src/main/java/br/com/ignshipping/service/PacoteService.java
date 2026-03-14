package br.com.ignshipping.service;

import br.com.ignshipping.domain.entity.OrderItem;
import br.com.ignshipping.domain.entity.Pacote;
import br.com.ignshipping.domain.entity.Tenant;
import br.com.ignshipping.domain.enums.StatusPacote;
import br.com.ignshipping.dto.vendedor.*;
import br.com.ignshipping.exception.BusinessException;
import br.com.ignshipping.exception.ResourceNotFoundException;
import br.com.ignshipping.repository.PacoteRepository;
import br.com.ignshipping.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PacoteService {

    private static final BigDecimal TAXA_CSSBUY_YUAN = new BigDecimal("30.00");

    private static final Map<StatusPacote, Set<StatusPacote>> TRANSICOES_VALIDAS = Map.of(
            StatusPacote.RASCUNHO, Set.of(StatusPacote.AGUARDANDO_ENVIO),
            StatusPacote.AGUARDANDO_ENVIO, Set.of(StatusPacote.EM_VIAGEM),
            StatusPacote.EM_VIAGEM, Set.of(StatusPacote.ALFANDEGA, StatusPacote.TRANSITO),
            StatusPacote.ALFANDEGA, Set.of(StatusPacote.TRANSITO),
            StatusPacote.TRANSITO, Set.of(StatusPacote.ENTREGUE),
            StatusPacote.ENTREGUE, Set.of(StatusPacote.FINALIZADO)
    );

    private final PacoteRepository pacoteRepository;
    private final TenantRepository tenantRepository;
    private final OrderItemService orderItemService;
    private final LimiteService limiteService;

    // ── Listagem ───────────────────────────────────────────────

    public List<PacoteResumoResponse> listar(Long tenantId, StatusPacote status) {
        List<Pacote> pacotes;
        if (status != null) {
            pacotes = pacoteRepository.findAllByTenantIdAndStatus(tenantId, status);
        } else {
            pacotes = pacoteRepository.findAllByTenantId(tenantId);
        }
        return pacotes.stream().map(this::toPacoteResumoResponse).toList();
    }

    // ── Criar ──────────────────────────────────────────────────

    @Transactional
    public PacoteResumoResponse criar(PacoteRequest request, Long tenantId) {
        limiteService.verificarLimitePacotesMes(tenantId);

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant não encontrado: " + tenantId));

        Pacote pacote = Pacote.builder()
                .tenant(tenant)
                .nome(request.nome())
                .status(StatusPacote.RASCUNHO)
                .tipoEnvio(request.tipoEnvio())
                .cambio(request.cambio())
                .taxaAlfandegariaBrl(request.taxaAlfandegariaBrl() != null
                        ? request.taxaAlfandegariaBrl() : BigDecimal.ZERO)
                .dataEnvio(request.dataEnvio())
                .observacoes(request.observacoes())
                .build();

        pacote = pacoteRepository.save(pacote);
        return toPacoteResumoResponse(pacote);
    }

    // ── Detalhes ───────────────────────────────────────────────

    public PacoteDetalheResponse buscarDetalhes(Long id, Long tenantId) {
        Pacote pacote = pacoteRepository.findByIdAndTenantIdWithItens(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Pacote não encontrado: " + id));

        List<OrderItem> itens = pacote.getItens();
        int pesoTotal = orderItemService.calcularPesoTotal(itens);
        BigDecimal custoTotal = calcularCustoTotalBrl(pacote, itens);
        BigDecimal receita = calcularReceitaTotal(itens);
        BigDecimal margem = calcularMargem(receita, custoTotal);
        int totalCompradores = (int) itens.stream()
                .map(i -> i.getComprador().getId()).distinct().count();
        int totalItens = itens.stream().mapToInt(OrderItem::getQuantidade).sum();

        List<ItensPorCompradorResponse> itensPorComprador =
                orderItemService.listarAgrupadosPorComprador(id, tenantId);

        BigDecimal cambio = pacote.getCambio() != null && pacote.getCambio().compareTo(BigDecimal.ZERO) > 0
                ? pacote.getCambio() : BigDecimal.ONE;
        BigDecimal freteInternYuan = pacote.getFreteInternacionalYuan() != null
                ? pacote.getFreteInternacionalYuan() : BigDecimal.ZERO;
        BigDecimal freteInternBrl = converterYuanParaBrl(freteInternYuan, cambio);

        return new PacoteDetalheResponse(
                pacote.getId(), pacote.getNome(), pacote.getStatus(), pacote.getTipoEnvio(),
                pesoTotal, custoTotal, receita, margem,
                totalCompradores, totalItens, pacote.getCambio(),
                pacote.getCriadoEm(), pacote.getDataEnvio(),
                TAXA_CSSBUY_YUAN, freteInternYuan, freteInternBrl,
                pacote.getTaxaAlfandegariaBrl(), itensPorComprador, pacote.getObservacoes()
        );
    }

    // ── Atualizar ──────────────────────────────────────────────

    @Transactional
    public PacoteResumoResponse atualizar(Long id, PacoteRequest request, Long tenantId) {
        Pacote pacote = pacoteRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Pacote não encontrado: " + id));

        boolean recalcular = false;

        // Detecta mudança de câmbio ou taxa alfandegária
        if (request.cambio() != null && (pacote.getCambio() == null
                || request.cambio().compareTo(pacote.getCambio()) != 0)) {
            recalcular = true;
        }
        if (request.taxaAlfandegariaBrl() != null && (pacote.getTaxaAlfandegariaBrl() == null
                || request.taxaAlfandegariaBrl().compareTo(pacote.getTaxaAlfandegariaBrl()) != 0)) {
            recalcular = true;
        }

        pacote.setNome(request.nome());
        pacote.setTipoEnvio(request.tipoEnvio());
        if (request.cambio() != null) {
            pacote.setCambio(request.cambio());
        }
        if (request.taxaAlfandegariaBrl() != null) {
            pacote.setTaxaAlfandegariaBrl(request.taxaAlfandegariaBrl());
        }
        pacote.setDataEnvio(request.dataEnvio());
        pacote.setObservacoes(request.observacoes());

        pacote = pacoteRepository.save(pacote);

        if (recalcular) {
            orderItemService.recalcularRateio(id);
        }

        return toPacoteResumoResponse(pacote);
    }

    // ── Status ─────────────────────────────────────────────────

    @Transactional
    public PacoteResumoResponse atualizarStatus(Long id, AtualizarStatusRequest request, Long tenantId) {
        Pacote pacote = pacoteRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Pacote não encontrado: " + id));

        StatusPacote statusAtual = pacote.getStatus();
        StatusPacote novoStatus = request.status();

        Set<StatusPacote> permitidos = TRANSICOES_VALIDAS.getOrDefault(statusAtual, Set.of());
        if (!permitidos.contains(novoStatus)) {
            throw new BusinessException(
                    "Transição inválida: " + statusAtual + " → " + novoStatus);
        }

        pacote.setStatus(novoStatus);
        pacote = pacoteRepository.save(pacote);
        return toPacoteResumoResponse(pacote);
    }

    // ── Resumo financeiro ──────────────────────────────────────

    public ResumoFinanceiroResponse getResumoFinanceiro(Long id, Long tenantId) {
        Pacote pacote = pacoteRepository.findByIdAndTenantIdWithItens(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Pacote não encontrado: " + id));

        List<OrderItem> itens = pacote.getItens();
        BigDecimal cambio = pacote.getCambio() != null && pacote.getCambio().compareTo(BigDecimal.ZERO) > 0
                ? pacote.getCambio() : BigDecimal.ONE;
        BigDecimal freteInternYuan = pacote.getFreteInternacionalYuan() != null
                ? pacote.getFreteInternacionalYuan() : BigDecimal.ZERO;

        BigDecimal custoTotalYuan = itens.stream()
                .map(i -> i.getProduto().getCustoYuan()
                        .add(i.getProduto().getFreteVendedorYuan())
                        .multiply(BigDecimal.valueOf(i.getQuantidade())))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .add(freteInternYuan)
                .add(TAXA_CSSBUY_YUAN);

        BigDecimal custoTotal = calcularCustoTotalBrl(pacote, itens);
        BigDecimal receita = calcularReceitaTotal(itens);
        BigDecimal lucro = receita.subtract(custoTotal);
        BigDecimal margem = calcularMargem(receita, custoTotal);

        BigDecimal freteInternBrl = converterYuanParaBrl(freteInternYuan, cambio);
        BigDecimal taxaCssbuyBrl = converterYuanParaBrl(TAXA_CSSBUY_YUAN, cambio);

        List<ItensPorCompradorResponse> compradores =
                orderItemService.listarAgrupadosPorComprador(id, tenantId);

        return new ResumoFinanceiroResponse(
                pacote.getId(), cambio, custoTotalYuan.setScale(2, RoundingMode.HALF_UP),
                custoTotal, receita, lucro.setScale(2, RoundingMode.HALF_UP), margem,
                freteInternYuan, freteInternBrl, TAXA_CSSBUY_YUAN, taxaCssbuyBrl,
                pacote.getTaxaAlfandegariaBrl(), compradores
        );
    }

    // ── Helpers ────────────────────────────────────────────────

    /**
     * Public accessor for other services (e.g. Dashboard) that need to build
     * a PacoteResumoResponse from a Pacote entity.
     */
    public PacoteResumoResponse toPacoteResumoResponsePublic(Pacote pacote) {
        return toPacoteResumoResponse(pacote);
    }

    private PacoteResumoResponse toPacoteResumoResponse(Pacote pacote) {
        List<OrderItem> itens = pacote.getItens();
        // Pode não estar carregado (Lazy) — nesse caso buscar explicitamente
        try {
            itens.size(); // force load
        } catch (Exception e) {
            Pacote loaded = pacoteRepository.findByIdAndTenantIdWithItens(pacote.getId(), pacote.getTenant().getId())
                    .orElse(pacote);
            itens = loaded.getItens();
        }

        int pesoTotal = orderItemService.calcularPesoTotal(itens);
        BigDecimal custoTotal = calcularCustoTotalBrl(pacote, itens);
        BigDecimal receita = calcularReceitaTotal(itens);
        BigDecimal margem = calcularMargem(receita, custoTotal);
        int totalCompradores = (int) itens.stream()
                .map(i -> i.getComprador().getId()).distinct().count();
        int totalItens = itens.stream().mapToInt(OrderItem::getQuantidade).sum();

        return new PacoteResumoResponse(
                pacote.getId(), pacote.getNome(), pacote.getStatus(), pacote.getTipoEnvio(),
                pesoTotal, custoTotal, receita, margem,
                totalCompradores, totalItens, pacote.getCambio(),
                pacote.getCriadoEm(), pacote.getDataEnvio()
        );
    }

    private BigDecimal calcularCustoTotalBrl(Pacote pacote, List<OrderItem> itens) {
        if (itens.isEmpty()) return BigDecimal.ZERO;

        BigDecimal cambio = pacote.getCambio() != null && pacote.getCambio().compareTo(BigDecimal.ZERO) > 0
                ? pacote.getCambio() : BigDecimal.ONE;
        BigDecimal taxaAlfandegariaBrl = pacote.getTaxaAlfandegariaBrl() != null
                ? pacote.getTaxaAlfandegariaBrl() : BigDecimal.ZERO;

        BigDecimal custoProdutos = itens.stream()
                .map(i -> i.getProduto().getCustoYuan()
                        .add(i.getProduto().getFreteVendedorYuan())
                        .divide(cambio, 10, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(i.getQuantidade())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal custoRateadoTotal = itens.stream()
                .map(i -> i.getCustoRateadoBrl() != null ? i.getCustoRateadoBrl() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return custoProdutos.add(custoRateadoTotal).add(taxaAlfandegariaBrl)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calcularReceitaTotal(List<OrderItem> itens) {
        return itens.stream()
                .map(OrderItem::getPrecoVendaBrl)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calcularMargem(BigDecimal receita, BigDecimal custo) {
        if (receita.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return receita.subtract(custo)
                .multiply(BigDecimal.valueOf(100))
                .divide(receita, 2, RoundingMode.HALF_UP);
    }

        private BigDecimal converterYuanParaBrl(BigDecimal valorYuan, BigDecimal cambioBrlParaYuan) {
                if (valorYuan == null || valorYuan.compareTo(BigDecimal.ZERO) == 0) {
                        return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
                }

                BigDecimal cambioSeguro = (cambioBrlParaYuan == null || cambioBrlParaYuan.compareTo(BigDecimal.ZERO) <= 0)
                                ? BigDecimal.ONE : cambioBrlParaYuan;

                return valorYuan.divide(cambioSeguro, 2, RoundingMode.HALF_UP);
        }
}

