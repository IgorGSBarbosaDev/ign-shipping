package br.com.ignshipping.service;

import br.com.ignshipping.domain.entity.Comprador;
import br.com.ignshipping.domain.entity.OrderItem;
import br.com.ignshipping.domain.entity.Tenant;
import br.com.ignshipping.domain.entity.Usuario;
import br.com.ignshipping.domain.enums.Role;
import br.com.ignshipping.domain.enums.StatusPagamento;
import br.com.ignshipping.dto.portal.PedidoCompradorResponse;
import br.com.ignshipping.dto.vendedor.CompradorHistoricoResponse;
import br.com.ignshipping.dto.vendedor.CompradorRequest;
import br.com.ignshipping.dto.vendedor.CompradorResponse;
import br.com.ignshipping.dto.vendedor.ConviteResponse;
import br.com.ignshipping.dto.vendedor.ProdutoResponse;
import br.com.ignshipping.exception.BusinessException;
import br.com.ignshipping.exception.ResourceNotFoundException;
import br.com.ignshipping.mapper.CompradorMapper;
import br.com.ignshipping.mapper.ProdutoMapper;
import br.com.ignshipping.repository.CompradorRepository;
import br.com.ignshipping.repository.OrderItemRepository;
import br.com.ignshipping.repository.TenantRepository;
import br.com.ignshipping.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompradorService {

    private final CompradorRepository compradorRepository;
    private final OrderItemRepository orderItemRepository;
    private final TenantRepository tenantRepository;
    private final UsuarioRepository usuarioRepository;
    private final LimiteService limiteService;
    private final CompradorMapper compradorMapper;
    private final ProdutoMapper produtoMapper;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public List<CompradorResponse> listar(Long tenantId) {
        return compradorRepository.findAllByTenantIdOrderByNomeAsc(tenantId)
                .stream()
                .map(this::toResponseComCalculos)
                .toList();
    }

    public CompradorResponse buscarPorId(Long id, Long tenantId) {
        Comprador comprador = findByIdAndTenant(id, tenantId);
        return toResponseComCalculos(comprador);
    }

    public CompradorHistoricoResponse buscarHistorico(Long id, Long tenantId) {
        Comprador comprador = findByIdAndTenant(id, tenantId);
        CompradorResponse compradorResponse = toResponseComCalculos(comprador);

        List<OrderItem> itens = orderItemRepository
                .findAllByCompradorIdAndTenantIdOrderByPacoteCriadoEmDescCriadoEmDesc(comprador.getId(), tenantId);

        BigDecimal totalPago = itens.stream()
                .filter(item -> item.getStatusPagamento() == StatusPagamento.PAGO)
                .map(OrderItem::getPrecoVendaBrl)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPendente = itens.stream()
                .filter(item -> item.getStatusPagamento() == StatusPagamento.PENDENTE)
                .map(OrderItem::getPrecoVendaBrl)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String nomeVendedor = usuarioRepository
                .findFirstByTenantIdAndRole(tenantId, Role.VENDEDOR)
                .map(Usuario::getNome)
                .orElse("Vendedor");

        List<PedidoCompradorResponse> pedidos = itens.stream()
                .map(item -> toPedidoResponse(item, nomeVendedor))
                .toList();

        return new CompradorHistoricoResponse(
                compradorResponse,
                pedidos.size(),
                totalPago,
                totalPendente,
                pedidos
        );
    }

    @Transactional
    public CompradorResponse criar(CompradorRequest request, Long tenantId) {
        limiteService.verificarLimiteCompradores(tenantId);

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant não encontrado: " + tenantId));

        Comprador comprador = compradorMapper.toEntity(request);
        comprador.setTenant(tenant);
        comprador = compradorRepository.save(comprador);

        return toResponseComCalculos(comprador);
    }

    @Transactional
    public CompradorResponse atualizar(Long id, CompradorRequest request, Long tenantId) {
        Comprador comprador = findByIdAndTenant(id, tenantId);
        compradorMapper.updateFromRequest(request, comprador);
        comprador = compradorRepository.save(comprador);
        return toResponseComCalculos(comprador);
    }

    @Transactional
    public void deletar(Long id, Long tenantId) {
        Comprador comprador = findByIdAndTenant(id, tenantId);
        if (orderItemRepository.existsByCompradorId(id)) {
            throw new BusinessException("Não é possível excluir comprador que possui pedidos");
        }
        compradorRepository.delete(comprador);
    }

    @Transactional
    public ConviteResponse gerarConvite(Long id, Long tenantId) {
        Comprador comprador = findByIdAndTenant(id, tenantId);

        String codigo = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        comprador.setCodigoConvite(codigo);
        compradorRepository.save(comprador);

        String link = frontendUrl + "/auth/cadastro?convite=" + codigo;
        return new ConviteResponse(codigo, link);
    }

    // ── Helpers ────────────────────────────────────────────────

    private Comprador findByIdAndTenant(Long id, Long tenantId) {
        return compradorRepository.findById(id)
                .filter(c -> c.getTenant().getId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("Comprador não encontrado: " + id));
    }

    private CompradorResponse toResponseComCalculos(Comprador comprador) {
        int totalPedidos = orderItemRepository.countByCompradorId(comprador.getId());
        BigDecimal totalGasto = orderItemRepository.sumPrecoVendaByCompradorId(comprador.getId());
        BigDecimal totalPendente = orderItemRepository.sumPendenteByCompradorId(comprador.getId());
        BigDecimal lucroGerado = orderItemRepository.sumLucroByCompradorId(comprador.getId());

        return new CompradorResponse(
                comprador.getId(),
                comprador.getNome(),
                comprador.getEmail(),
                comprador.getTelefone(),
                totalPedidos,
                totalGasto,
                totalPendente,
                lucroGerado,
                comprador.getCodigoConvite()
        );
    }

    private PedidoCompradorResponse toPedidoResponse(OrderItem item, String nomeVendedor) {
        ProdutoResponse produto = produtoMapper.toResponse(item.getProduto());

        return new PedidoCompradorResponse(
                item.getId(),
                produto,
                item.getQuantidade(),
                item.getPrecoVendaBrl(),
                item.getPacote().getStatus(),
                item.getStatusPagamento(),
                item.getPacote().getCriadoEm(),
                nomeVendedor
        );
    }
}

