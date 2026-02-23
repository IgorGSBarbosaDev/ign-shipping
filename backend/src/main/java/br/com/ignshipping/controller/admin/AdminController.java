package br.com.ignshipping.controller.admin;

import br.com.ignshipping.domain.enums.NomePlano;
import br.com.ignshipping.dto.admin.AlterarPlanoRequest;
import br.com.ignshipping.dto.admin.DashboardAdminResponse;
import br.com.ignshipping.dto.admin.TenantAdminResponse;
import br.com.ignshipping.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardAdminResponse> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    @GetMapping("/tenants")
    public ResponseEntity<List<TenantAdminResponse>> listarTenants(
            @RequestParam(required = false) NomePlano plano,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(adminService.listarTenants(plano, status));
    }

    @GetMapping("/tenants/{id}")
    public ResponseEntity<TenantAdminResponse> buscarTenant(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.buscarTenant(id));
    }

    @PatchMapping("/tenants/{id}/suspender")
    public ResponseEntity<Map<String, String>> suspenderTenant(@PathVariable Long id) {
        adminService.suspenderTenant(id);
        return ResponseEntity.ok(Map.of("message", "Tenant suspenso com sucesso"));
    }

    @PatchMapping("/tenants/{id}/reativar")
    public ResponseEntity<Map<String, String>> reativarTenant(@PathVariable Long id) {
        adminService.reativarTenant(id);
        return ResponseEntity.ok(Map.of("message", "Tenant reativado com sucesso"));
    }

    @PatchMapping("/tenants/{id}/plano")
    public ResponseEntity<Map<String, String>> alterarPlano(@PathVariable Long id,
                                                             @Valid @RequestBody AlterarPlanoRequest request) {
        adminService.alterarPlano(id, request.plano());
        return ResponseEntity.ok(Map.of("message", "Plano alterado com sucesso"));
    }
}

