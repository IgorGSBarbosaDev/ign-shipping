package br.com.ignshipping.service;

import br.com.ignshipping.domain.entity.Comprador;
import br.com.ignshipping.domain.entity.OrderItem;
import br.com.ignshipping.domain.entity.Usuario;
import br.com.ignshipping.domain.enums.Role;
import br.com.ignshipping.domain.enums.StatusPagamento;
import br.com.ignshipping.dto.portal.MeusPedidosResponse;
import br.com.ignshipping.dto.portal.PedidoCompradorResponse;
import br.com.ignshipping.dto.vendedor.ProdutoResponse;
import br.com.ignshipping.exception.ResourceNotFoundException;
import br.com.ignshipping.mapper.ProdutoMapper;
import br.com.ignshipping.repository.CompradorRepository;
import br.com.ignshipping.repository.OrderItemRepository;
import br.com.ignshipping.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PortalCompradorService {

    private final CompradorRepository compradorRepository;
    private final OrderItemRepository orderItemRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProdutoMapper produtoMapper;

    public MeusPedidosResponse getMeusPedidos(Long usuarioId) {
        Comprador comprador = compradorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Comprador não encontrado para este usuário"));

        List<OrderItem> itens = orderItemRepository.findAllByCompradorId(comprador.getId());

        BigDecimal totalPago = itens.stream()
                .filter(i -> i.getStatusPagamento() == StatusPagamento.PAGO)
                .map(OrderItem::getPrecoVendaBrl)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPendente = itens.stream()
                .filter(i -> i.getStatusPagamento() == StatusPagamento.PENDENTE)
                .map(OrderItem::getPrecoVendaBrl)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<PedidoCompradorResponse> pedidos = itens.stream()
                .map(item -> toPedidoResponse(item, comprador))
                .toList();

        return new MeusPedidosResponse(itens.size(), totalPago, totalPendente, pedidos);
    }

    public PedidoCompradorResponse getDetalhePedido(Long itemId, Long usuarioId) {
        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido não encontrado: " + itemId));

        Comprador comprador = item.getComprador();
        if (comprador.getUsuario() == null || !comprador.getUsuario().getId().equals(usuarioId)) {
            throw new ResourceNotFoundException("Pedido não encontrado: " + itemId);
        }

        return toPedidoResponse(item, comprador);
    }

    private PedidoCompradorResponse toPedidoResponse(OrderItem item, Comprador comprador) {
        ProdutoResponse produto = produtoMapper.toResponse(item.getProduto());

        String nomeVendedor = usuarioRepository
                .findFirstByTenantIdAndRole(comprador.getTenant().getId(), Role.VENDEDOR)
                .map(Usuario::getNome)
                .orElse("Vendedor");

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

