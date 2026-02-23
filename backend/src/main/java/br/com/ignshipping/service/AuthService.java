package br.com.ignshipping.service;

import br.com.ignshipping.domain.entity.*;
import br.com.ignshipping.domain.enums.NomePlano;
import br.com.ignshipping.domain.enums.Role;
import br.com.ignshipping.domain.enums.TipoEnvio;
import br.com.ignshipping.dto.auth.*;
import br.com.ignshipping.exception.BusinessException;
import br.com.ignshipping.exception.ResourceNotFoundException;
import br.com.ignshipping.repository.*;
import br.com.ignshipping.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final TenantRepository tenantRepository;
    private final PlanoRepository planoRepository;
    private final CompradorRepository compradorRepository;
    private final FaixaFreteRepository faixaFreteRepository;
    private final TokenRecuperacaoSenhaRepository tokenRecuperacaoSenhaRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final JavaMailSender mailSender;

    // ── Login ──────────────────────────────────────────────────

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.senha())
        );

        Usuario usuario = usuarioRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException("Credenciais inválidas"));

        return buildLoginResponse(usuario);
    }

    // ── Cadastro Vendedor ──────────────────────────────────────

    @Transactional
    public LoginResponse cadastrarVendedor(CadastroVendedorRequest request) {
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new BusinessException("Email já cadastrado");
        }

        Plano planoPro = planoRepository.findByNome(NomePlano.PRO)
                .orElseThrow(() -> new BusinessException("Plano PRO não encontrado"));

        Tenant tenant = Tenant.builder()
                .plano(planoPro)
                .statusConta("TRIAL")
                .trialExpiraEm(LocalDateTime.now().plusDays(14))
                .build();
        tenant = tenantRepository.save(tenant);

        Usuario usuario = Usuario.builder()
                .tenant(tenant)
                .nome(request.nome())
                .email(request.email())
                .senhaHash(passwordEncoder.encode(request.senha()))
                .role(Role.VENDEDOR)
                .ativo(true)
                .build();
        usuario = usuarioRepository.save(usuario);

        inserirFaixasFretesPadrao(tenant);

        return buildLoginResponse(usuario);
    }

    // ── Cadastro Comprador ─────────────────────────────────────

    @Transactional
    public LoginResponse cadastrarComprador(CadastroCompradorRequest request) {
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new BusinessException("Email já cadastrado");
        }

        Comprador comprador = compradorRepository.findByCodigoConvite(request.codigoConvite())
                .orElseThrow(() -> new ResourceNotFoundException("Código de convite inválido"));

        if (comprador.getUsuario() != null) {
            throw new BusinessException("Este código de convite já foi utilizado");
        }

        Usuario usuario = Usuario.builder()
                .tenant(comprador.getTenant())
                .nome(request.nome())
                .email(request.email())
                .senhaHash(passwordEncoder.encode(request.senha()))
                .role(Role.COMPRADOR)
                .ativo(true)
                .build();
        usuario = usuarioRepository.save(usuario);

        comprador.setUsuario(usuario);
        if (request.telefone() != null && !request.telefone().isBlank() && comprador.getTelefone() == null) {
            comprador.setTelefone(request.telefone());
        }
        compradorRepository.save(comprador);

        return buildLoginResponse(usuario);
    }

    // ── Recuperar Senha ────────────────────────────────────────

    @Transactional
    public void recuperarSenha(RecuperarSenhaRequest request) {
        usuarioRepository.findByEmail(request.email()).ifPresent(usuario -> {
            // Invalida tokens antigos
            tokenRecuperacaoSenhaRepository.findAll().stream()
                    .filter(t -> t.getUsuario().getId().equals(usuario.getId()) && !t.isUsado())
                    .forEach(t -> {
                        t.setUsado(true);
                        tokenRecuperacaoSenhaRepository.save(t);
                    });

            String token = UUID.randomUUID().toString();

            TokenRecuperacaoSenha tokenEntity = TokenRecuperacaoSenha.builder()
                    .usuario(usuario)
                    .token(token)
                    .expiraEm(LocalDateTime.now().plusHours(2))
                    .usado(false)
                    .build();
            tokenRecuperacaoSenhaRepository.save(tokenEntity);

            enviarEmailRecuperacao(usuario.getEmail(), token);
        });
    }

    // ── Redefinir Senha ────────────────────────────────────────

    @Transactional
    public void redefinirSenha(RedefinirSenhaRequest request) {
        TokenRecuperacaoSenha tokenEntity = tokenRecuperacaoSenhaRepository
                .findByTokenAndUsadoFalse(request.token())
                .orElseThrow(() -> new BusinessException("Token inválido ou expirado"));

        if (tokenEntity.getExpiraEm().isBefore(LocalDateTime.now())) {
            throw new BusinessException("Token inválido ou expirado");
        }

        Usuario usuario = tokenEntity.getUsuario();
        usuario.setSenhaHash(passwordEncoder.encode(request.novaSenha()));
        usuarioRepository.save(usuario);

        tokenEntity.setUsado(true);
        tokenRecuperacaoSenhaRepository.save(tokenEntity);
    }

    // ── Helpers ────────────────────────────────────────────────

    private LoginResponse buildLoginResponse(Usuario usuario) {
        Long tenantId = usuario.getTenant() != null ? usuario.getTenant().getId() : null;

        String token = jwtUtils.generateToken(
                usuario.getId(),
                tenantId,
                usuario.getRole().name(),
                usuario.getEmail()
        );

        UsuarioResumoResponse usuarioResumo = new UsuarioResumoResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getRole().name(),
                tenantId
        );

        return new LoginResponse(token, "Bearer", jwtUtils.getExpirationMs(), usuarioResumo);
    }

    private void inserirFaixasFretesPadrao(Tenant tenant) {
        List<FaixaFrete> faixas = List.of(
                // EXPRESSA
                buildFaixa(tenant, TipoEnvio.EXPRESSA, 0, 1000, "80"),
                buildFaixa(tenant, TipoEnvio.EXPRESSA, 1001, 2000, "140"),
                buildFaixa(tenant, TipoEnvio.EXPRESSA, 2001, 3000, "190"),
                buildFaixa(tenant, TipoEnvio.EXPRESSA, 3001, 5000, "280"),
                // ECONOMICA
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

    private void enviarEmailRecuperacao(String email, String token) {
        try {
            String link = "http://localhost:5173/auth/redefinir-senha?token=" + token;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("IGN Shipping - Recuperação de Senha");
            message.setText(
                    "Olá,\n\n" +
                    "Você solicitou a recuperação de senha.\n\n" +
                    "Clique no link abaixo para redefinir sua senha:\n" +
                    link + "\n\n" +
                    "Este link expira em 2 horas.\n\n" +
                    "Se você não solicitou esta alteração, ignore este email.\n\n" +
                    "Atenciosamente,\nEquipe IGN Shipping"
            );

            mailSender.send(message);
        } catch (Exception e) {
            log.error("Erro ao enviar email de recuperação de senha para {}: {}", email, e.getMessage());
        }
    }
}

