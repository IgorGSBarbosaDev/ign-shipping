package br.com.ignshipping.controller.vendedor;

import br.com.ignshipping.domain.enums.Categoria;
import br.com.ignshipping.dto.vendedor.FotoUploadResponse;
import br.com.ignshipping.dto.vendedor.ProdutoRequest;
import br.com.ignshipping.dto.vendedor.ProdutoResponse;
import br.com.ignshipping.security.TenantContext;
import br.com.ignshipping.service.ProdutoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/vendedor/produtos")
@PreAuthorize("hasRole('VENDEDOR')")
@RequiredArgsConstructor
public class ProdutoController {

    private final ProdutoService produtoService;

    @GetMapping
    public ResponseEntity<List<ProdutoResponse>> listar(
            @RequestParam(required = false) Categoria categoria) {
        Long tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(produtoService.listar(tenantId, categoria));
    }

    @PostMapping
    public ResponseEntity<ProdutoResponse> criar(@Valid @RequestBody ProdutoRequest request) {
        Long tenantId = TenantContext.getCurrentTenant();
        ProdutoResponse response = produtoService.criar(request, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProdutoResponse> buscarPorId(@PathVariable Long id) {
        Long tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(produtoService.buscarPorId(id, tenantId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProdutoResponse> atualizar(@PathVariable Long id,
                                                      @Valid @RequestBody ProdutoRequest request) {
        Long tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(produtoService.atualizar(id, request, tenantId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Long tenantId = TenantContext.getCurrentTenant();
        produtoService.deletar(id, tenantId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{id}/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FotoUploadResponse> uploadFoto(@PathVariable Long id,
                                                          @RequestParam("foto") MultipartFile foto) {
        Long tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(produtoService.uploadFoto(id, tenantId, foto));
    }
}

