package br.com.ignshipping.service;

import br.com.ignshipping.domain.entity.Produto;
import br.com.ignshipping.domain.entity.Tenant;
import br.com.ignshipping.domain.enums.Categoria;
import br.com.ignshipping.dto.vendedor.FotoUploadResponse;
import br.com.ignshipping.dto.vendedor.ProdutoRequest;
import br.com.ignshipping.dto.vendedor.ProdutoResponse;
import br.com.ignshipping.exception.BusinessException;
import br.com.ignshipping.exception.ResourceNotFoundException;
import br.com.ignshipping.mapper.ProdutoMapper;
import br.com.ignshipping.repository.OrderItemRepository;
import br.com.ignshipping.repository.ProdutoRepository;
import br.com.ignshipping.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final OrderItemRepository orderItemRepository;
    private final TenantRepository tenantRepository;
    private final LimiteService limiteService;
    private final ProdutoMapper produtoMapper;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public List<ProdutoResponse> listar(Long tenantId, Categoria categoria) {
        List<Produto> produtos;
        if (categoria != null) {
            produtos = produtoRepository.findAllByTenantIdAndCategoria(tenantId, categoria);
        } else {
            produtos = produtoRepository.findAllByTenantId(tenantId);
        }
        return produtos.stream()
                .map(produtoMapper::toResponse)
                .toList();
    }

    public ProdutoResponse buscarPorId(Long id, Long tenantId) {
        Produto produto = findByIdAndTenant(id, tenantId);
        return produtoMapper.toResponse(produto);
    }

    @Transactional
    public ProdutoResponse criar(ProdutoRequest request, Long tenantId) {
        limiteService.verificarLimiteProdutos(tenantId);

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant não encontrado: " + tenantId));

        Produto produto = produtoMapper.toEntity(request);
        produto.setTenant(tenant);

        if (produto.getFreteVendedorYuan() == null) {
            produto.setFreteVendedorYuan(BigDecimal.ZERO);
        }
        if (produto.getCustoCompraYuan() == null) {
            produto.setCustoCompraYuan(produto.getCustoYuan());
        }

        produto = produtoRepository.save(produto);
        return produtoMapper.toResponse(produto);
    }

    @Transactional
    public ProdutoResponse atualizar(Long id, ProdutoRequest request, Long tenantId) {
        Produto produto = findByIdAndTenant(id, tenantId);
        produtoMapper.updateFromRequest(request, produto);

        if (produto.getFreteVendedorYuan() == null) {
            produto.setFreteVendedorYuan(BigDecimal.ZERO);
        }
        if (produto.getCustoCompraYuan() == null) {
            produto.setCustoCompraYuan(produto.getCustoYuan());
        }

        produto = produtoRepository.save(produto);
        return produtoMapper.toResponse(produto);
    }

    @Transactional
    public void deletar(Long id, Long tenantId) {
        Produto produto = findByIdAndTenant(id, tenantId);
        if (orderItemRepository.existsByProdutoId(id)) {
            throw new BusinessException("Não é possível excluir produto que está em pedidos");
        }
        produtoRepository.delete(produto);
    }

    @Transactional
    public FotoUploadResponse uploadFoto(Long id, Long tenantId, MultipartFile foto) {
        Produto produto = findByIdAndTenant(id, tenantId);

        if (foto.isEmpty()) {
            throw new BusinessException("Arquivo de foto não pode ser vazio");
        }

        try {
            String originalFilename = foto.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String filename = UUID.randomUUID() + extension;
            Path dirPath = Paths.get(uploadDir, tenantId.toString());
            Files.createDirectories(dirPath);

            Path filePath = dirPath.resolve(filename);
            Files.copy(foto.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String fotoUrl = "uploads/" + tenantId + "/" + filename;
            produto.setFotoUrl(fotoUrl);
            produtoRepository.save(produto);

            return new FotoUploadResponse(fotoUrl);
        } catch (IOException e) {
            log.error("Erro ao salvar foto do produto {}: {}", id, e.getMessage());
            throw new BusinessException("Erro ao salvar arquivo de foto");
        }
    }

    // ── Helpers ────────────────────────────────────────────────

    private Produto findByIdAndTenant(Long id, Long tenantId) {
        return produtoRepository.findById(id)
                .filter(p -> p.getTenant().getId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + id));
    }
}

