package br.com.ignshipping.controller.vendedor;

import br.com.ignshipping.domain.enums.StatusPacote;
import br.com.ignshipping.dto.vendedor.*;
import br.com.ignshipping.security.TenantContext;
import br.com.ignshipping.service.PacoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendedor/pacotes")
@PreAuthorize("hasRole('VENDEDOR')")
@RequiredArgsConstructor
public class PacoteController {

    private final PacoteService pacoteService;

    @GetMapping
    public ResponseEntity<List<PacoteResumoResponse>> listar(
            @RequestParam(required = false) StatusPacote status) {
        Long tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(pacoteService.listar(tenantId, status));
    }

    @PostMapping
    public ResponseEntity<PacoteResumoResponse> criar(@Valid @RequestBody PacoteRequest request) {
        Long tenantId = TenantContext.getCurrentTenant();
        PacoteResumoResponse response = pacoteService.criar(request, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PacoteDetalheResponse> buscarDetalhes(@PathVariable Long id) {
        Long tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(pacoteService.buscarDetalhes(id, tenantId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PacoteResumoResponse> atualizar(@PathVariable Long id,
                                                           @Valid @RequestBody PacoteRequest request) {
        Long tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(pacoteService.atualizar(id, request, tenantId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PacoteResumoResponse> atualizarStatus(@PathVariable Long id,
                                                                 @Valid @RequestBody AtualizarStatusRequest request) {
        Long tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(pacoteService.atualizarStatus(id, request, tenantId));
    }

    @GetMapping("/{id}/resumo-financeiro")
    public ResponseEntity<ResumoFinanceiroResponse> getResumoFinanceiro(@PathVariable Long id) {
        Long tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(pacoteService.getResumoFinanceiro(id, tenantId));
    }
}

