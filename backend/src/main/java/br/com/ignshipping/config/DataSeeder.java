package br.com.ignshipping.config;

import br.com.ignshipping.domain.entity.*;
import br.com.ignshipping.domain.enums.NomePlano;
import br.com.ignshipping.domain.enums.Role;
import br.com.ignshipping.domain.enums.TipoEnvio;
import br.com.ignshipping.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@Profile("!prod")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final TenantRepository tenantRepository;
    private final PlanoRepository planoRepository;
    private final CompradorRepository compradorRepository;
    private final FaixaFreteRepository faixaFreteRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("=== Iniciando DataSeeder - Criação de usuários de teste ===");

        Tenant tenantVendedor = criarVendedor();
        criarAdmin();
        criarCliente(tenantVendedor);

        log.info("=== DataSeeder finalizado ===");
    }

    private Tenant criarVendedor() {
        String email = "vendedor@teste.com";

        if (usuarioRepository.existsByEmail(email)) {
            log.info("Vendedor de teste já existe: {}", email);
            return usuarioRepository.findByEmail(email).orElseThrow().getTenant();
        }

        Plano planoPro = planoRepository.findByNome(NomePlano.PRO)
                .orElseThrow(() -> new RuntimeException("Plano PRO não encontrado"));

        Tenant tenant = Tenant.builder()
                .plano(planoPro)
                .statusConta("TRIAL")
                .trialExpiraEm(LocalDateTime.now().plusDays(14))
                .build();
        tenant = tenantRepository.save(tenant);

        Usuario vendedor = Usuario.builder()
                .tenant(tenant)
                .nome("Vendedor Teste")
                .email(email)
                .senhaHash(passwordEncoder.encode("rF8$wP3^N6*zY1!d"))
                .role(Role.VENDEDOR)
                .ativo(true)
                .build();
        usuarioRepository.save(vendedor);

        inserirFaixasFretesPadrao(tenant);

        log.info("Vendedor de teste criado: {}", email);
        return tenant;
    }

    private void criarAdmin() {
        String email = "Admin@admin.com";

        if (usuarioRepository.existsByEmail(email)) {
            log.info("Admin de teste já existe: {}", email);
            return;
        }

        Usuario admin = Usuario.builder()
                .tenant(null)
                .nome("Admin Teste")
                .email(email)
                .senhaHash(passwordEncoder.encode("V9#tQ7!mL2@xZ4&k"))
                .role(Role.ADMIN)
                .ativo(true)
                .build();
        usuarioRepository.save(admin);

        log.info("Admin de teste criado: {}", email);
    }

    private void criarCliente(Tenant tenantVendedor) {
        String email = "Cliente@teste.com";

        if (usuarioRepository.existsByEmail(email)) {
            log.info("Cliente de teste já existe: {}", email);
            return;
        }

        Usuario cliente = Usuario.builder()
                .tenant(tenantVendedor)
                .nome("Cliente Teste")
                .email(email)
                .senhaHash(passwordEncoder.encode("T4@hK9&cR2!vX7%q"))
                .role(Role.COMPRADOR)
                .ativo(true)
                .build();
        cliente = usuarioRepository.save(cliente);

        Comprador comprador = Comprador.builder()
                .tenant(tenantVendedor)
                .usuario(cliente)
                .nome("Cliente Teste")
                .email(email)
                .codigoConvite("TESTE-CLIENTE")
                .build();
        compradorRepository.save(comprador);

        log.info("Cliente de teste criado: {}", email);
    }

    private void inserirFaixasFretesPadrao(Tenant tenant) {
        List<FaixaFrete> faixas = List.of(
                buildFaixa(tenant, TipoEnvio.EXPRESSA, 0, 1000, "80"),
                buildFaixa(tenant, TipoEnvio.EXPRESSA, 1001, 2000, "140"),
                buildFaixa(tenant, TipoEnvio.EXPRESSA, 2001, 3000, "190"),
                buildFaixa(tenant, TipoEnvio.EXPRESSA, 3001, 5000, "280"),
                buildFaixa(tenant, TipoEnvio.ECONOMICA, 0, 1000, "45"),
                buildFaixa(tenant, TipoEnvio.ECONOMICA, 1001, 2000, "85"),
                buildFaixa(tenant, TipoEnvio.ECONOMICA, 2001, 3000, "120"),
                buildFaixa(tenant, TipoEnvio.ECONOMICA, 3001, 5000, "175")
        );
        faixaFreteRepository.saveAll(faixas);
    }

    private FaixaFrete buildFaixa(Tenant tenant, TipoEnvio tipo, int min, int max, String custoYuan) {
        return FaixaFrete.builder()
                .tenant(tenant)
                .tipoEnvio(tipo)
                .pesoMinGramas(min)
                .pesoMaxGramas(max)
                .custoYuan(new BigDecimal(custoYuan))
                .build();
    }
}
