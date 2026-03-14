package br.com.ignshipping.controller.vendedor;

import br.com.ignshipping.dto.vendedor.CompradorRequest;
import br.com.ignshipping.dto.vendedor.CompradorHistoricoResponse;
import br.com.ignshipping.dto.vendedor.CompradorResponse;
import br.com.ignshipping.dto.vendedor.ConviteResponse;
import br.com.ignshipping.security.TenantContext;
import br.com.ignshipping.service.CompradorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendedor/compradores")
@PreAuthorize("hasRole('VENDEDOR')")
@RequiredArgsConstructor
public class CompradorController {

    private final CompradorService compradorService;

    @GetMapping
    public ResponseEntity<List<CompradorResponse>> listar() {
        Long tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(compradorService.listar(tenantId));
    }

    @PostMapping
    public ResponseEntity<CompradorResponse> criar(@Valid @RequestBody CompradorRequest request) {
        Long tenantId = TenantContext.getCurrentTenant();
        CompradorResponse response = compradorService.criar(request, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompradorResponse> buscarPorId(@PathVariable Long id) {
        Long tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(compradorService.buscarPorId(id, tenantId));
    }

    @GetMapping("/{id}/historico")
    public ResponseEntity<CompradorHistoricoResponse> buscarHistorico(@PathVariable Long id) {
        Long tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(compradorService.buscarHistorico(id, tenantId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompradorResponse> atualizar(@PathVariable Long id,
                                                        @Valid @RequestBody CompradorRequest request) {
        Long tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(compradorService.atualizar(id, request, tenantId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Long tenantId = TenantContext.getCurrentTenant();
        compradorService.deletar(id, tenantId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/convite")
    public ResponseEntity<ConviteResponse> gerarConvite(@PathVariable Long id) {
        Long tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(compradorService.gerarConvite(id, tenantId));
    }
}

