package br.com.ignshipping.service;

import br.com.ignshipping.domain.entity.Comprador;
import br.com.ignshipping.domain.entity.Tenant;
import br.com.ignshipping.dto.vendedor.CompradorRequest;
import br.com.ignshipping.dto.vendedor.CompradorResponse;
import br.com.ignshipping.dto.vendedor.ConviteResponse;
import br.com.ignshipping.exception.BusinessException;
import br.com.ignshipping.exception.ResourceNotFoundException;
import br.com.ignshipping.mapper.CompradorMapper;
import br.com.ignshipping.repository.CompradorRepository;
import br.com.ignshipping.repository.OrderItemRepository;
import br.com.ignshipping.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
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
    private final LimiteService limiteService;
    private final CompradorMapper compradorMapper;

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

        String link = "http://localhost:5173/auth/cadastro?convite=" + codigo;
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
}

