package br.com.ignshipping.controller.vendedor;

import br.com.ignshipping.dto.vendedor.ContaPlanoResponse;
import br.com.ignshipping.security.TenantContext;
import br.com.ignshipping.service.ContaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vendedor/conta")
@PreAuthorize("hasRole('VENDEDOR')")
@RequiredArgsConstructor
public class ContaController {

    private final ContaService contaService;

    @GetMapping("/plano")
    public ResponseEntity<ContaPlanoResponse> getInfoPlano() {
        Long tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(contaService.getInfoPlano(tenantId));
    }
}

