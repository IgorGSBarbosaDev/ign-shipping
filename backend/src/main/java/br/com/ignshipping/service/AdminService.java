package br.com.ignshipping.service;

import br.com.ignshipping.domain.entity.Plano;
import br.com.ignshipping.domain.entity.Tenant;
import br.com.ignshipping.domain.entity.Usuario;
import br.com.ignshipping.domain.enums.NomePlano;
import br.com.ignshipping.domain.enums.Role;
import br.com.ignshipping.dto.admin.DashboardAdminResponse;
import br.com.ignshipping.dto.admin.TenantAdminResponse;
import br.com.ignshipping.exception.ResourceNotFoundException;
import br.com.ignshipping.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final TenantRepository tenantRepository;
    private final UsuarioRepository usuarioRepository;
    private final CompradorRepository compradorRepository;
    private final PacoteRepository pacoteRepository;
    private final PlanoRepository planoRepository;

    // ── Dashboard ──────────────────────────────────────────────

    public DashboardAdminResponse getDashboard() {
        long totalTenants = tenantRepository.count();
        long tenantsPagantes = tenantRepository.countTenantsPagantes();
        BigDecimal mrr = tenantRepository.sumMrr();
        long novosCadastros = tenantRepository.countByCriadoEmAfter(LocalDateTime.now().minusDays(30));
        long totalCompradores = compradorRepository.count();
        long totalPacotes = pacoteRepository.count();

        return new DashboardAdminResponse(
                totalTenants, tenantsPagantes, mrr, novosCadastros,
                totalCompradores, totalPacotes
        );
    }

    // ── Tenants ────────────────────────────────────────────────

    public List<TenantAdminResponse> listarTenants(NomePlano plano, String status) {
        List<Tenant> tenants;

        if (plano != null && status != null) {
            tenants = tenantRepository.findAllByPlanoNomeAndStatusConta(plano, status);
        } else if (plano != null) {
            tenants = tenantRepository.findAllByPlanoNome(plano);
        } else if (status != null) {
            tenants = tenantRepository.findAllByStatusConta(status);
        } else {
            tenants = tenantRepository.findAll();
        }

        return tenants.stream().map(this::toTenantAdminResponse).toList();
    }

    public TenantAdminResponse buscarTenant(Long id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant não encontrado: " + id));
        return toTenantAdminResponse(tenant);
    }

    @Transactional
    public void suspenderTenant(Long id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant não encontrado: " + id));

        tenant.setStatusConta("SUSPENSO");
        tenantRepository.save(tenant);

        List<Usuario> usuarios = usuarioRepository.findAllByTenantId(id);
        usuarios.forEach(u -> u.setAtivo(false));
        usuarioRepository.saveAll(usuarios);
    }

    @Transactional
    public void reativarTenant(Long id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant não encontrado: " + id));

        tenant.setStatusConta("ATIVO");
        tenantRepository.save(tenant);

        List<Usuario> usuarios = usuarioRepository.findAllByTenantId(id);
        usuarios.forEach(u -> u.setAtivo(true));
        usuarioRepository.saveAll(usuarios);
    }

    @Transactional
    public void alterarPlano(Long id, NomePlano novoPlano) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant não encontrado: " + id));

        Plano plano = planoRepository.findByNome(novoPlano)
                .orElseThrow(() -> new ResourceNotFoundException("Plano não encontrado: " + novoPlano));

        tenant.setPlano(plano);
        tenantRepository.save(tenant);
    }

    // ── Helpers ────────────────────────────────────────────────

    private TenantAdminResponse toTenantAdminResponse(Tenant tenant) {
        Usuario vendedor = usuarioRepository
                .findFirstByTenantIdAndRole(tenant.getId(), Role.VENDEDOR)
                .orElse(null);

        String nomeVendedor = vendedor != null ? vendedor.getNome() : "—";
        String email = vendedor != null ? vendedor.getEmail() : "—";
        LocalDateTime ultimoAcesso = vendedor != null ? vendedor.getCriadoEm() : null;

        long totalPacotes = pacoteRepository.countByTenantId(tenant.getId());
        long totalCompradores = compradorRepository.countByTenantId(tenant.getId());
        BigDecimal mrr = tenant.getPlano().getPrecoMensalBrl();

        return new TenantAdminResponse(
                tenant.getId(), nomeVendedor, email,
                tenant.getPlano().getNome(), tenant.getStatusConta(),
                tenant.getCriadoEm(), ultimoAcesso,
                totalPacotes, totalCompradores, mrr
        );
    }
}

