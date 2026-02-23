package br.com.ignshipping.controller.vendedor;

import br.com.ignshipping.dto.vendedor.OrcamentoRequest;
import br.com.ignshipping.dto.vendedor.OrcamentoResponse;
import br.com.ignshipping.dto.vendedor.OrcamentoResultadoResponse;
import br.com.ignshipping.security.TenantContext;
import br.com.ignshipping.service.OrcamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendedor/orcamentos")
@PreAuthorize("hasRole('VENDEDOR')")
@RequiredArgsConstructor
public class OrcamentoController {

    private final OrcamentoService orcamentoService;

    @GetMapping
    public ResponseEntity<List<OrcamentoResponse>> listar() {
        Long tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(orcamentoService.listar(tenantId));
    }

    @PostMapping
    public ResponseEntity<OrcamentoResponse> salvar(@Valid @RequestBody OrcamentoRequest request) {
        Long tenantId = TenantContext.getCurrentTenant();
        OrcamentoResponse response = orcamentoService.salvar(request, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/simular")
    public ResponseEntity<OrcamentoResultadoResponse> simular(@Valid @RequestBody OrcamentoRequest request) {
        return ResponseEntity.ok(orcamentoService.simular(request));
    }
}

