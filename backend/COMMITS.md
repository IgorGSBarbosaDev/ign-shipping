# Guia de Commits — IGN Shipping Backend

> **Branch recomendada:** `feature/backend-foundation`  
> Crie a branch antes de começar: `git checkout -b feature/backend-foundation`

---

## COMMIT 1 — B1: Fundação do projeto

**Branch:** `feature/backend-foundation`  
**Mensagem de commit:**
```
feat(foundation): configura dependências, segurança JWT e estrutura base

- Adiciona dependências ao pom.xml: spring-security, jjwt 0.12.5, mail, mapstruct 1.5.5, springdoc 2.5.0
- Configura application.properties: datasource, flyway, jwt, cors, mail, multipart
- Cria enums: Role, Categoria, StatusPacote, TipoEnvio, NomePlano, StatusPagamento
- Implementa segurança JWT: JwtUtils, TenantContext, JwtAuthFilter, UserDetailsServiceImpl
- Configura SecurityConfig com rotas públicas e stateless session
- Configura CorsConfig para http://localhost:5173
- Cria GlobalExceptionHandler com tratamento de ResourceNotFoundException, LimitePlanoExcedidoException, MethodArgumentNotValidException e Exception genérica
- Cria exceções customizadas: ResourceNotFoundException, LimitePlanoExcedidoException, BusinessException
- Cria DTOs de erro: ErrorResponse, ValidationErrorResponse
```

**Arquivos deste commit:**
```
pom.xml
src/main/resources/application.properties
src/main/java/br/com/ignshipping/domain/enums/Role.java
src/main/java/br/com/ignshipping/domain/enums/Categoria.java
src/main/java/br/com/ignshipping/domain/enums/StatusPacote.java
src/main/java/br/com/ignshipping/domain/enums/TipoEnvio.java
src/main/java/br/com/ignshipping/domain/enums/NomePlano.java
src/main/java/br/com/ignshipping/domain/enums/StatusPagamento.java
src/main/java/br/com/ignshipping/security/JwtUtils.java
src/main/java/br/com/ignshipping/security/TenantContext.java
src/main/java/br/com/ignshipping/security/JwtAuthFilter.java
src/main/java/br/com/ignshipping/security/UserDetailsServiceImpl.java
src/main/java/br/com/ignshipping/config/SecurityConfig.java
src/main/java/br/com/ignshipping/config/CorsConfig.java
src/main/java/br/com/ignshipping/exception/GlobalExceptionHandler.java
src/main/java/br/com/ignshipping/exception/ResourceNotFoundException.java
src/main/java/br/com/ignshipping/exception/LimitePlanoExcedidoException.java
src/main/java/br/com/ignshipping/exception/BusinessException.java
src/main/java/br/com/ignshipping/dto/ErrorResponse.java
src/main/java/br/com/ignshipping/dto/ValidationErrorResponse.java
```

---

## COMMIT 2 — B2: Migrations SQL, Entidades JPA e Repositories

**Branch:** `feature/backend-foundation`  
**Mensagem de commit:**
```
feat(domain): adiciona migrations Flyway, entidades JPA e repositories

- Cria 11 migrations Flyway (V1 a V11): planos, tenants, usuarios, compradores,
  produtos, pacotes, order_items, faixas_frete, orcamentos, tokens_recuperacao_senha e admin inicial
- Cria entidades JPA: Plano, Tenant, Usuario (implementa UserDetails), Comprador,
  Produto, Pacote, OrderItem, FaixaFrete, Orcamento, TokenRecuperacaoSenha
- Cria repositories JPA com queries customizadas para cada entidade
- Completa UserDetailsServiceImpl com carregamento real do Usuario via UsuarioRepository
```

**Arquivos deste commit:**
```
src/main/resources/db/migration/V1__criar_tabela_planos.sql
src/main/resources/db/migration/V2__criar_tabela_tenants.sql
src/main/resources/db/migration/V3__criar_tabela_usuarios.sql
src/main/resources/db/migration/V4__criar_tabela_compradores.sql
src/main/resources/db/migration/V5__criar_tabela_produtos.sql
src/main/resources/db/migration/V6__criar_tabela_pacotes.sql
src/main/resources/db/migration/V7__criar_tabela_order_items.sql
src/main/resources/db/migration/V8__criar_tabela_faixas_frete.sql
src/main/resources/db/migration/V9__criar_tabela_orcamentos.sql
src/main/resources/db/migration/V10__criar_tabela_tokens_senha.sql
src/main/resources/db/migration/V11__inserir_faixas_frete_padrao_para_novos_tenants.sql
src/main/java/br/com/ignshipping/domain/entity/Plano.java
src/main/java/br/com/ignshipping/domain/entity/Tenant.java
src/main/java/br/com/ignshipping/domain/entity/Usuario.java
src/main/java/br/com/ignshipping/domain/entity/Comprador.java
src/main/java/br/com/ignshipping/domain/entity/Produto.java
src/main/java/br/com/ignshipping/domain/entity/Pacote.java
src/main/java/br/com/ignshipping/domain/entity/OrderItem.java
src/main/java/br/com/ignshipping/domain/entity/FaixaFrete.java
src/main/java/br/com/ignshipping/domain/entity/Orcamento.java
src/main/java/br/com/ignshipping/domain/entity/TokenRecuperacaoSenha.java
src/main/java/br/com/ignshipping/repository/PlanoRepository.java
src/main/java/br/com/ignshipping/repository/TenantRepository.java
src/main/java/br/com/ignshipping/repository/UsuarioRepository.java
src/main/java/br/com/ignshipping/repository/CompradorRepository.java
src/main/java/br/com/ignshipping/repository/ProdutoRepository.java
src/main/java/br/com/ignshipping/repository/PacoteRepository.java
src/main/java/br/com/ignshipping/repository/OrderItemRepository.java
src/main/java/br/com/ignshipping/repository/FaixaFreteRepository.java
src/main/java/br/com/ignshipping/repository/OrcamentoRepository.java
src/main/java/br/com/ignshipping/repository/TokenRecuperacaoSenhaRepository.java
src/main/java/br/com/ignshipping/security/UserDetailsServiceImpl.java  ← atualizado
```

---

## COMMIT 3 — B3: Autenticação completa

**Branch:** `feature/backend-foundation`  
**Mensagem de commit:**
```
feat(auth): implementa fluxo completo de autenticação JWT

- Cria DTOs de auth: LoginRequest, LoginResponse, UsuarioResumoResponse,
  CadastroVendedorRequest, CadastroCompradorRequest, RecuperarSenhaRequest, RedefinirSenhaRequest
- Implementa AuthService: login, cadastro de vendedor (cria Tenant + faixas frete padrão),
  cadastro de comprador (via código de convite), recuperar senha e redefinir senha
- Cria AuthController com os 5 endpoints: POST /api/auth/login,
  POST /api/auth/cadastro/vendedor, POST /api/auth/cadastro/comprador,
  POST /api/auth/recuperar-senha, POST /api/auth/redefinir-senha
- Adiciona bean AuthenticationManager ao SecurityConfig
```

**Arquivos deste commit:**
```
src/main/java/br/com/ignshipping/dto/auth/LoginRequest.java
src/main/java/br/com/ignshipping/dto/auth/LoginResponse.java
src/main/java/br/com/ignshipping/dto/auth/UsuarioResumoResponse.java
src/main/java/br/com/ignshipping/dto/auth/CadastroVendedorRequest.java
src/main/java/br/com/ignshipping/dto/auth/CadastroCompradorRequest.java
src/main/java/br/com/ignshipping/dto/auth/RecuperarSenhaRequest.java
src/main/java/br/com/ignshipping/dto/auth/RedefinirSenhaRequest.java
src/main/java/br/com/ignshipping/service/AuthService.java
src/main/java/br/com/ignshipping/controller/AuthController.java
src/main/java/br/com/ignshipping/config/SecurityConfig.java  ← atualizado (AuthenticationManager)
```

---

## COMMIT 4 — B4: Compradores, Produtos e LimiteService

**Branch:** `feature/backend-foundation`  
**Mensagem de commit:**
```
feat(vendedor): adiciona CRUD de compradores e produtos com controle de limites do plano

- Cria LimiteService: verificarLimiteCompradores, verificarLimiteProdutos,
  verificarLimitePacotesMes e getUsoAtual (UsoPlanoPorcentagem)
- Cria DTOs de comprador: CompradorRequest, CompradorResponse (com campos calculados),
  ConviteResponse
- Cria DTOs de produto: ProdutoRequest, ProdutoResponse, FotoUploadResponse
- Implementa CompradorService: listar, buscar, criar, atualizar, deletar, gerarConvite
- Implementa ProdutoService: listar (com filtro por categoria), buscar, criar,
  atualizar, deletar, uploadFoto
- Cria mappers MapStruct: CompradorMapper, ProdutoMapper
- Cria controllers: CompradorController e ProdutoController
  em /api/vendedor/compradores e /api/vendedor/produtos
- Adiciona queries de agregação ao OrderItemRepository
```

**Arquivos deste commit:**
```
src/main/java/br/com/ignshipping/service/LimiteService.java
src/main/java/br/com/ignshipping/dto/vendedor/UsoPlanoPorcentagem.java
src/main/java/br/com/ignshipping/dto/vendedor/CompradorRequest.java
src/main/java/br/com/ignshipping/dto/vendedor/CompradorResponse.java
src/main/java/br/com/ignshipping/dto/vendedor/ConviteResponse.java
src/main/java/br/com/ignshipping/dto/vendedor/ProdutoRequest.java
src/main/java/br/com/ignshipping/dto/vendedor/ProdutoResponse.java
src/main/java/br/com/ignshipping/dto/vendedor/FotoUploadResponse.java
src/main/java/br/com/ignshipping/service/CompradorService.java
src/main/java/br/com/ignshipping/service/ProdutoService.java
src/main/java/br/com/ignshipping/mapper/CompradorMapper.java
src/main/java/br/com/ignshipping/mapper/ProdutoMapper.java
src/main/java/br/com/ignshipping/controller/vendedor/CompradorController.java
src/main/java/br/com/ignshipping/controller/vendedor/ProdutoController.java
src/main/java/br/com/ignshipping/repository/OrderItemRepository.java  ← atualizado
src/main/java/br/com/ignshipping/repository/CompradorRepository.java  ← atualizado
```

---

## COMMIT 5 — B5: Pacotes, Itens e Lógica de Rateio

**Branch:** `feature/backend-foundation`  
**Mensagem de commit:**
```
feat(pacotes): implementa gestão de pacotes, itens e cálculo de rateio de custos

- Cria DTOs de pacote: PacoteRequest, PacoteResumoResponse, PacoteDetalheResponse,
  AtualizarStatusRequest, ResumoFinanceiroResponse
- Cria DTOs de item: OrderItemRequest, OrderItemUpdateRequest, OrderItemResponse,
  ItensPorCompradorResponse
- Implementa OrderItemService: recalcularRateio (fórmula de distribuição proporcional
  ao peso), adicionarItem, atualizarItem, removerItem, listarAgrupadosPorComprador
- Implementa PacoteService: listar, criar, buscarDetalhes, atualizar (dispara recálculo
  se câmbio/taxa mudou), atualizarStatus (com validação de transições), getResumoFinanceiro
- Cria controllers: PacoteController e ItemController
  em /api/vendedor/pacotes e /api/vendedor/pacotes/{pacoteId}/itens
- Adiciona query com JOIN FETCH ao PacoteRepository para evitar N+1
```

**Arquivos deste commit:**
```
src/main/java/br/com/ignshipping/dto/vendedor/PacoteRequest.java
src/main/java/br/com/ignshipping/dto/vendedor/PacoteResumoResponse.java
src/main/java/br/com/ignshipping/dto/vendedor/PacoteDetalheResponse.java
src/main/java/br/com/ignshipping/dto/vendedor/AtualizarStatusRequest.java
src/main/java/br/com/ignshipping/dto/vendedor/ResumoFinanceiroResponse.java
src/main/java/br/com/ignshipping/dto/vendedor/OrderItemRequest.java
src/main/java/br/com/ignshipping/dto/vendedor/OrderItemUpdateRequest.java
src/main/java/br/com/ignshipping/dto/vendedor/OrderItemResponse.java
src/main/java/br/com/ignshipping/dto/vendedor/ItensPorCompradorResponse.java
src/main/java/br/com/ignshipping/service/OrderItemService.java
src/main/java/br/com/ignshipping/service/PacoteService.java
src/main/java/br/com/ignshipping/controller/vendedor/PacoteController.java
src/main/java/br/com/ignshipping/controller/vendedor/ItemController.java
src/main/java/br/com/ignshipping/repository/PacoteRepository.java  ← atualizado
```

---

## COMMIT 6 — B6: Frete, Orçamento e Dashboard do Vendedor

**Branch:** `feature/backend-foundation`  
**Mensagem de commit:**
```
feat(vendedor): adiciona tabela de frete, simulador de orçamento e dashboard

- Cria DTOs de frete: FaixaFreteRequest, FaixaFreteResponse,
  CalcularFreteRequest, CalcularFreteResponse
- Cria DTOs de orçamento: OrcamentoRequest, OrcamentoResultadoResponse, OrcamentoResponse
- Cria DTOs de dashboard: DashboardVendedorResponse
- Cria DTOs de conta: PlanoResponse, ContaPlanoResponse
- Implementa FreteService: listarFaixas, criarFaixa (valida sobreposição),
  calcularFrete (busca faixa por peso e tipoEnvio)
- Implementa OrcamentoService: calcular (fórmula completa de custo/margem),
  simular (sem persistir) e salvar (persiste + retorna calculado)
- Implementa DashboardVendedorService: totalReceberBrl, compradoresPendentes,
  lucroTotalBrl, totalPacotes, ticketMedio, uso do plano, pacotesRecentes
- Implementa ContaService: info do plano e uso atual
- Cria controllers: FreteController, OrcamentoController,
  DashboardVendedorController, ContaController
```

**Arquivos deste commit:**
```
src/main/java/br/com/ignshipping/dto/vendedor/FaixaFreteRequest.java
src/main/java/br/com/ignshipping/dto/vendedor/FaixaFreteResponse.java
src/main/java/br/com/ignshipping/dto/vendedor/CalcularFreteRequest.java
src/main/java/br/com/ignshipping/dto/vendedor/CalcularFreteResponse.java
src/main/java/br/com/ignshipping/dto/vendedor/OrcamentoRequest.java
src/main/java/br/com/ignshipping/dto/vendedor/OrcamentoResultadoResponse.java
src/main/java/br/com/ignshipping/dto/vendedor/OrcamentoResponse.java
src/main/java/br/com/ignshipping/dto/vendedor/DashboardVendedorResponse.java
src/main/java/br/com/ignshipping/dto/vendedor/PlanoResponse.java
src/main/java/br/com/ignshipping/dto/vendedor/ContaPlanoResponse.java
src/main/java/br/com/ignshipping/service/FreteService.java
src/main/java/br/com/ignshipping/service/OrcamentoService.java
src/main/java/br/com/ignshipping/service/DashboardVendedorService.java
src/main/java/br/com/ignshipping/service/ContaService.java
src/main/java/br/com/ignshipping/controller/vendedor/FreteController.java
src/main/java/br/com/ignshipping/controller/vendedor/OrcamentoController.java
src/main/java/br/com/ignshipping/controller/vendedor/DashboardVendedorController.java
src/main/java/br/com/ignshipping/controller/vendedor/ContaController.java
src/main/java/br/com/ignshipping/repository/OrderItemRepository.java  ← atualizado (queries dashboard)
src/main/java/br/com/ignshipping/repository/TenantRepository.java    ← atualizado (queries admin)
```

---

## COMMIT 7 — B7: Portal do Comprador e painel Admin

**Branch:** `feature/backend-foundation`  
**Mensagem de commit:**
```
feat(portal,admin): implementa portal do comprador e painel administrativo

- Cria DTOs do portal: MeusPedidosResponse, PedidoCompradorResponse
- Implementa PortalCompradorService: getMeusPedidos (todos os itens do comprador autenticado),
  getDetalhePedido (valida posse do comprador)
- Cria PortalCompradorController em /api/portal com @PreAuthorize("hasRole('COMPRADOR')")
- Cria DTOs admin: DashboardAdminResponse, TenantAdminResponse, AlterarPlanoRequest
- Implementa AdminService: getDashboard (métricas globais), listarTenants (com filtros
  opcionais por plano e status), buscarTenant, suspenderTenant (desativa usuários),
  reativarTenant (reativa usuários), alterarPlano
- Cria AdminController em /api/admin com @PreAuthorize("hasRole('ADMIN')")
- Adiciona queries ao UsuarioRepository e TenantRepository
```

**Arquivos deste commit:**
```
src/main/java/br/com/ignshipping/dto/portal/MeusPedidosResponse.java
src/main/java/br/com/ignshipping/dto/portal/PedidoCompradorResponse.java
src/main/java/br/com/ignshipping/service/PortalCompradorService.java
src/main/java/br/com/ignshipping/controller/portal/PortalCompradorController.java
src/main/java/br/com/ignshipping/dto/admin/DashboardAdminResponse.java
src/main/java/br/com/ignshipping/dto/admin/TenantAdminResponse.java
src/main/java/br/com/ignshipping/dto/admin/AlterarPlanoRequest.java
src/main/java/br/com/ignshipping/service/AdminService.java
src/main/java/br/com/ignshipping/controller/admin/AdminController.java
src/main/java/br/com/ignshipping/repository/UsuarioRepository.java   ← atualizado
src/main/java/br/com/ignshipping/repository/TenantRepository.java    ← atualizado
src/main/java/br/com/ignshipping/repository/CompradorRepository.java ← atualizado (findByUsuarioId)
```

---

## Sequência de comandos Git

```bash
# Criar e entrar na branch
git checkout -b feature/backend-foundation

# Commit 1 — B1: Fundação
git add pom.xml \
  src/main/resources/application.properties \
  src/main/java/br/com/ignshipping/domain/enums/ \
  src/main/java/br/com/ignshipping/security/ \
  src/main/java/br/com/ignshipping/config/ \
  src/main/java/br/com/ignshipping/exception/ \
  src/main/java/br/com/ignshipping/dto/ErrorResponse.java \
  src/main/java/br/com/ignshipping/dto/ValidationErrorResponse.java
git commit -m "feat(foundation): configura dependências, segurança JWT e estrutura base"

# Commit 2 — B2: Migrations, Entidades e Repositories
git add src/main/resources/db/migration/ \
  src/main/java/br/com/ignshipping/domain/entity/ \
  src/main/java/br/com/ignshipping/repository/
git commit -m "feat(domain): adiciona migrations Flyway, entidades JPA e repositories"

# Commit 3 — B3: Auth
git add src/main/java/br/com/ignshipping/dto/auth/ \
  src/main/java/br/com/ignshipping/service/AuthService.java \
  src/main/java/br/com/ignshipping/controller/AuthController.java
git commit -m "feat(auth): implementa fluxo completo de autenticação JWT"

# Commit 4 — B4: Compradores e Produtos
git add src/main/java/br/com/ignshipping/service/LimiteService.java \
  src/main/java/br/com/ignshipping/service/CompradorService.java \
  src/main/java/br/com/ignshipping/service/ProdutoService.java \
  src/main/java/br/com/ignshipping/mapper/ \
  src/main/java/br/com/ignshipping/controller/vendedor/CompradorController.java \
  src/main/java/br/com/ignshipping/controller/vendedor/ProdutoController.java
git commit -m "feat(vendedor): adiciona CRUD de compradores e produtos com controle de limites do plano"

# Commit 5 — B5: Pacotes e Itens
git add src/main/java/br/com/ignshipping/service/OrderItemService.java \
  src/main/java/br/com/ignshipping/service/PacoteService.java \
  src/main/java/br/com/ignshipping/controller/vendedor/PacoteController.java \
  src/main/java/br/com/ignshipping/controller/vendedor/ItemController.java
git commit -m "feat(pacotes): implementa gestão de pacotes, itens e cálculo de rateio de custos"

# Commit 6 — B6: Frete, Orçamento e Dashboard
git add src/main/java/br/com/ignshipping/service/FreteService.java \
  src/main/java/br/com/ignshipping/service/OrcamentoService.java \
  src/main/java/br/com/ignshipping/service/DashboardVendedorService.java \
  src/main/java/br/com/ignshipping/service/ContaService.java \
  src/main/java/br/com/ignshipping/controller/vendedor/FreteController.java \
  src/main/java/br/com/ignshipping/controller/vendedor/OrcamentoController.java \
  src/main/java/br/com/ignshipping/controller/vendedor/DashboardVendedorController.java \
  src/main/java/br/com/ignshipping/controller/vendedor/ContaController.java
git commit -m "feat(vendedor): adiciona tabela de frete, simulador de orçamento e dashboard"

# Commit 7 — B7: Portal e Admin
git add src/main/java/br/com/ignshipping/dto/portal/ \
  src/main/java/br/com/ignshipping/dto/admin/ \
  src/main/java/br/com/ignshipping/service/PortalCompradorService.java \
  src/main/java/br/com/ignshipping/service/AdminService.java \
  src/main/java/br/com/ignshipping/controller/portal/ \
  src/main/java/br/com/ignshipping/controller/admin/
git commit -m "feat(portal,admin): implementa portal do comprador e painel administrativo"

# Commit final — DTOs restantes e documentação
git add src/main/java/br/com/ignshipping/dto/ COMMITS.md
git commit -m "chore: adiciona DTOs restantes e guia de commits"

# Push da branch
git push origin feature/backend-foundation
```

---

## Convenção de commits usada (Conventional Commits)

| Prefixo  | Quando usar                                      |
|----------|--------------------------------------------------|
| `feat`   | Nova funcionalidade                              |
| `fix`    | Correção de bug                                  |
| `chore`  | Tarefas de manutenção, config, documentação      |
| `refactor` | Refatoração sem mudança de comportamento       |
| `test`   | Adição ou correção de testes                     |

---

## Fluxo de branches sugerido

```
main
 └── develop
      └── feature/backend-foundation  ← trabalhe aqui
```

Ao finalizar, faça o merge via Pull Request:  
`feature/backend-foundation` → `develop` → (após validação) → `main`

