package br.com.ignshipping.controller.vendedor;

import br.com.ignshipping.dto.vendedor.CalcularFreteRequest;
import br.com.ignshipping.dto.vendedor.CalcularFreteResponse;
import br.com.ignshipping.dto.vendedor.FaixaFreteRequest;
import br.com.ignshipping.dto.vendedor.FaixaFreteResponse;
import br.com.ignshipping.security.TenantContext;
import br.com.ignshipping.service.FreteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendedor/frete")
@PreAuthorize("hasRole('VENDEDOR')")
@RequiredArgsConstructor
public class FreteController {

    private final FreteService freteService;

    @GetMapping("/tabela")
    public ResponseEntity<List<FaixaFreteResponse>> listarFaixas() {
        Long tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(freteService.listarFaixas(tenantId));
    }

    @PostMapping("/tabela")
    public ResponseEntity<FaixaFreteResponse> criarFaixa(@Valid @RequestBody FaixaFreteRequest request) {
        Long tenantId = TenantContext.getCurrentTenant();
        FaixaFreteResponse response = freteService.criarFaixa(request, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/calcular")
    public ResponseEntity<CalcularFreteResponse> calcularFrete(@Valid @RequestBody CalcularFreteRequest request) {
        Long tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(freteService.calcularFrete(request, tenantId));
    }
}

