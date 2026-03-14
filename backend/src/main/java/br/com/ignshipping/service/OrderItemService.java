package br.com.ignshipping.service;

import br.com.ignshipping.domain.entity.Comprador;
import br.com.ignshipping.domain.entity.OrderItem;
import br.com.ignshipping.domain.entity.Pacote;
import br.com.ignshipping.domain.entity.Produto;
import br.com.ignshipping.domain.enums.StatusPacote;
import br.com.ignshipping.domain.enums.StatusPagamento;
import br.com.ignshipping.dto.vendedor.*;
import br.com.ignshipping.exception.BusinessException;
import br.com.ignshipping.exception.ResourceNotFoundException;
import br.com.ignshipping.mapper.ProdutoMapper;
import br.com.ignshipping.repository.CompradorRepository;
import br.com.ignshipping.repository.OrderItemRepository;
import br.com.ignshipping.repository.PacoteRepository;
import br.com.ignshipping.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderItemService {

    private static final BigDecimal TAXA_CSSBUY_YUAN = new BigDecimal("30.00");

    private final OrderItemRepository orderItemRepository;
    private final PacoteRepository pacoteRepository;
    private final CompradorRepository compradorRepository;
    private final ProdutoRepository produtoRepository;
    private final ProdutoMapper produtoMapper;

    // ── Recálculo de rateio ────────────────────────────────────

    @Transactional
    public void recalcularRateio(Long pacoteId) {
        Pacote pacote = pacoteRepository.findById(pacoteId)
                .orElseThrow(() -> new ResourceNotFoundException("Pacote não encontrado: " + pacoteId));

        List<OrderItem> itens = orderItemRepository.findAllByPacoteId(pacoteId);
        if (itens.isEmpty()) return;

        // Forçar carregamento dos produtos
        itens.forEach(item -> item.getProduto().getPesoGramas());

        BigDecimal cambio = pacote.getCambio() != null && pacote.getCambio().compareTo(BigDecimal.ZERO) > 0
                ? pacote.getCambio() : BigDecimal.ONE;
        BigDecimal freteInternYuan = pacote.getFreteInternacionalYuan() != null
                ? pacote.getFreteInternacionalYuan() : BigDecimal.ZERO;

        int pesoTotalPacote = itens.stream()
                .mapToInt(item -> item.getProduto().getPesoGramas() * item.getQuantidade())
                .sum();

        if (pesoTotalPacote == 0) return;

        for (OrderItem item : itens) {
            int pesoItem = item.getProduto().getPesoGramas() * item.getQuantidade();
            BigDecimal proporcaoPeso = BigDecimal.valueOf(pesoItem)
                    .divide(BigDecimal.valueOf(pesoTotalPacote), 10, RoundingMode.HALF_UP);

            // custoRateadoBrl = ((freteInternYuan + taxaCssbuyYuan) / cambio) * proporcaoPeso
            BigDecimal custoRateado = freteInternYuan.add(TAXA_CSSBUY_YUAN)
                    .divide(cambio, 10, RoundingMode.HALF_UP)
                    .multiply(proporcaoPeso)
                    .setScale(2, RoundingMode.HALF_UP);

            item.setCustoRateadoBrl(custoRateado);
        }

        orderItemRepository.saveAll(itens);
    }

    // ── CRUD ───────────────────────────────────────────────────

    @Transactional
    public OrderItemResponse adicionarItem(Long pacoteId, OrderItemRequest request, Long tenantId) {
        Pacote pacote = buscarPacoteDoTenant(pacoteId, tenantId);
        validarPacoteNaoFinalizado(pacote);

        Comprador comprador = compradorRepository.findById(request.compradorId())
                .filter(c -> c.getTenant().getId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("Comprador não encontrado: " + request.compradorId()));

        Produto produto = produtoRepository.findById(request.produtoId())
                .filter(p -> p.getTenant().getId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + request.produtoId()));

        OrderItem item = OrderItem.builder()
                .tenant(pacote.getTenant())
                .pacote(pacote)
                .comprador(comprador)
                .produto(produto)
                .quantidade(request.quantidade() != null ? request.quantidade() : 1)
                .precoVendaBrl(request.precoVendaBrl())
                .statusPagamento(request.statusPagamento() != null ? request.statusPagamento() : StatusPagamento.PENDENTE)
                .build();

        item = orderItemRepository.save(item);

        recalcularRateio(pacoteId);

        // Recarregar para ter custoRateado atualizado
        item = orderItemRepository.findById(item.getId()).orElseThrow();
        return toOrderItemResponse(item, pacote);
    }

    @Transactional
    public OrderItemResponse atualizarItem(Long pacoteId, Long itemId, OrderItemUpdateRequest request, Long tenantId) {
        Pacote pacote = buscarPacoteDoTenant(pacoteId, tenantId);
        validarPacoteNaoFinalizado(pacote);

        OrderItem item = orderItemRepository.findById(itemId)
                .filter(i -> i.getPacote().getId().equals(pacoteId))
                .orElseThrow(() -> new ResourceNotFoundException("Item não encontrado: " + itemId));

        if (request.quantidade() != null) {
            item.setQuantidade(request.quantidade());
        }
        if (request.precoVendaBrl() != null) {
            item.setPrecoVendaBrl(request.precoVendaBrl());
        }
        if (request.statusPagamento() != null) {
            item.setStatusPagamento(request.statusPagamento());
        }

        orderItemRepository.save(item);
        recalcularRateio(pacoteId);

        item = orderItemRepository.findById(item.getId()).orElseThrow();
        return toOrderItemResponse(item, pacote);
    }

    @Transactional
    public void removerItem(Long pacoteId, Long itemId, Long tenantId) {
        buscarPacoteDoTenant(pacoteId, tenantId);

        OrderItem item = orderItemRepository.findById(itemId)
                .filter(i -> i.getPacote().getId().equals(pacoteId))
                .orElseThrow(() -> new ResourceNotFoundException("Item não encontrado: " + itemId));

        orderItemRepository.delete(item);
        recalcularRateio(pacoteId);
    }

    // ── Listagem agrupada ──────────────────────────────────────

    public List<ItensPorCompradorResponse> listarAgrupadosPorComprador(Long pacoteId, Long tenantId) {
        Pacote pacote = pacoteRepository.findByIdAndTenantIdWithItens(pacoteId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Pacote não encontrado: " + pacoteId));

        List<OrderItem> itens = pacote.getItens();
        if (itens.isEmpty()) return List.of();

        int pesoTotalPacote = calcularPesoTotal(itens);

        Map<Long, List<OrderItem>> porComprador = itens.stream()
                .collect(Collectors.groupingBy(
                        item -> item.getComprador().getId(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<ItensPorCompradorResponse> resultado = new ArrayList<>();

        for (var entry : porComprador.entrySet()) {
            List<OrderItem> itensComprador = entry.getValue();
            Comprador comprador = itensComprador.getFirst().getComprador();

            List<OrderItemResponse> itensResponse = itensComprador.stream()
                    .map(item -> toOrderItemResponseComPeso(item, pacote, pesoTotalPacote))
                    .toList();

            resultado.add(buildItensPorCompradorResponse(comprador, itensComprador, itensResponse));
        }

        return resultado;
    }

    // ── Helpers ────────────────────────────────────────────────

    private Pacote buscarPacoteDoTenant(Long pacoteId, Long tenantId) {
        return pacoteRepository.findByIdAndTenantId(pacoteId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Pacote não encontrado: " + pacoteId));
    }

    private void validarPacoteNaoFinalizado(Pacote pacote) {
        if (pacote.getStatus() == StatusPacote.FINALIZADO) {
            throw new BusinessException("Não é possível modificar um pacote finalizado");
        }
    }

    public int calcularPesoTotal(List<OrderItem> itens) {
        return itens.stream()
                .mapToInt(item -> item.getProduto().getPesoGramas() * item.getQuantidade())
                .sum();
    }

    private OrderItemResponse toOrderItemResponse(OrderItem item, Pacote pacote) {
        List<OrderItem> todosItens = orderItemRepository.findAllByPacoteId(pacote.getId());
        todosItens.forEach(i -> i.getProduto().getPesoGramas()); // force load
        int pesoTotal = calcularPesoTotal(todosItens);
        return toOrderItemResponseComPeso(item, pacote, pesoTotal);
    }

    private OrderItemResponse toOrderItemResponseComPeso(OrderItem item, Pacote pacote, int pesoTotalPacote) {
        BigDecimal cambio = pacote.getCambio() != null && pacote.getCambio().compareTo(BigDecimal.ZERO) > 0
                ? pacote.getCambio() : BigDecimal.ONE;
        BigDecimal taxaAlfandegariaBrl = pacote.getTaxaAlfandegariaBrl() != null
                ? pacote.getTaxaAlfandegariaBrl() : BigDecimal.ZERO;
        BigDecimal freteInternYuan = pacote.getFreteInternacionalYuan() != null
                ? pacote.getFreteInternacionalYuan() : BigDecimal.ZERO;

        int pesoItem = item.getProduto().getPesoGramas() * item.getQuantidade();
        double proporcaoPeso = pesoTotalPacote > 0 ? (double) pesoItem / pesoTotalPacote : 0;

        BigDecimal custoRateado = item.getCustoRateadoBrl() != null ? item.getCustoRateadoBrl() : BigDecimal.ZERO;

        // custoTotalItem = ((custoYuan + freteVendedorYuan) / cambio) * quantidade + custoRateado + (taxaAlfandegaria * proporcao)
        BigDecimal custoTotalItem = item.getProduto().getCustoYuan()
                .add(item.getProduto().getFreteVendedorYuan())
                .divide(cambio, 10, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(item.getQuantidade()))
                .add(custoRateado)
                .add(taxaAlfandegariaBrl.multiply(BigDecimal.valueOf(proporcaoPeso)))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal lucroItem = item.getPrecoVendaBrl().subtract(custoTotalItem);

        return new OrderItemResponse(
                item.getId(),
                item.getComprador().getId(),
                item.getComprador().getNome(),
                produtoMapper.toResponse(item.getProduto()),
                item.getQuantidade(),
                item.getPrecoVendaBrl(),
                custoRateado,
                lucroItem,
                Math.round(proporcaoPeso * 10000.0) / 10000.0,
                item.getStatusPagamento()
        );
    }

    ItensPorCompradorResponse buildItensPorCompradorResponse(
            Comprador comprador, List<OrderItem> itensComprador,
            List<OrderItemResponse> itensResponse) {

        int totalItens = itensComprador.stream().mapToInt(OrderItem::getQuantidade).sum();
        int pesoTotal = itensComprador.stream()
                .mapToInt(i -> i.getProduto().getPesoGramas() * i.getQuantidade()).sum();

        BigDecimal subtotalVenda = itensResponse.stream()
                .map(OrderItemResponse::precoVendaBrl)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal subtotalCusto = itensResponse.stream()
                .map(r -> r.precoVendaBrl().subtract(r.lucroItemBrl()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal lucro = subtotalVenda.subtract(subtotalCusto);
        BigDecimal margem = subtotalVenda.compareTo(BigDecimal.ZERO) > 0
                ? lucro.multiply(BigDecimal.valueOf(100)).divide(subtotalVenda, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal totalPendente = itensComprador.stream()
                .filter(i -> i.getStatusPagamento() == StatusPagamento.PENDENTE)
                .map(OrderItem::getPrecoVendaBrl)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new ItensPorCompradorResponse(
                comprador.getId(),
                comprador.getNome(),
                totalItens,
                pesoTotal,
                subtotalCusto.setScale(2, RoundingMode.HALF_UP),
                subtotalVenda,
                lucro.setScale(2, RoundingMode.HALF_UP),
                margem,
                totalPendente
        ,
                itensResponse
        );
    }
}




