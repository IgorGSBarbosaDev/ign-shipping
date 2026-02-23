package br.com.ignshipping.controller.vendedor;

import br.com.ignshipping.dto.vendedor.DashboardVendedorResponse;
import br.com.ignshipping.security.TenantContext;
import br.com.ignshipping.service.DashboardVendedorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vendedor/dashboard")
@PreAuthorize("hasRole('VENDEDOR')")
@RequiredArgsConstructor
public class DashboardVendedorController {

    private final DashboardVendedorService dashboardVendedorService;

    @GetMapping
    public ResponseEntity<DashboardVendedorResponse> getResumo() {
        Long tenantId = TenantContext.getCurrentTenant();
        return ResponseEntity.ok(dashboardVendedorService.getResumo(tenantId));
    }
}

