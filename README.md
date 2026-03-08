# IGN Shipping

Plataforma SaaS multi-tenant para gestão de importações informais da China para o Brasil. Permite que vendedores gerenciem pacotes, aloquem custos de frete proporcionalmente entre compradores, simulem precificação e acompanhem margens de lucro.

## Sumário

- [Visão Geral](#visão-geral)
- [Stack Tecnológica](#stack-tecnológica)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Configuração](#instalação-e-configuração)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Migrações de Banco de Dados](#migrações-de-banco-de-dados)
- [Endpoints da API](#endpoints-da-api)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Multi-Tenancy e Segurança](#multi-tenancy-e-segurança)
- [Algoritmo de Rateio de Frete](#algoritmo-de-rateio-de-frete)
- [Planos e Limites](#planos-e-limites)

---

## Visão Geral

O sistema atende três perfis de usuário:

- **Vendedor** — Gerencia compradores, produtos, pacotes, frete, simulações de custo e acompanha KPIs financeiros.
- **Comprador** — Acessa o portal para visualizar seus pedidos e status de pagamento.
- **Admin** — Administra tenants da plataforma, planos de assinatura e métricas globais.

### Funcionalidades principais

- Cadastro de vendedores com trial de 14 dias (plano PRO)
- CRUD de compradores, produtos e pacotes
- Rateio proporcional de frete por peso entre itens do pacote
- Simulador de custos e precificação em tempo real
- Dashboard com KPIs financeiros
- Portal do comprador com convite por código
- Painel administrativo com gestão de tenants
- Recuperação de senha por e-mail

---

## Stack Tecnológica

### Backend

| Tecnologia | Versão | Uso |
|---|---|---|
| Java | 21 | Runtime |
| Spring Boot | 4.0.3 | Framework web / REST API |
| Spring Security | Boot-managed | Autenticação JWT + RBAC |
| Spring Data JPA | Boot-managed | ORM / acesso a dados |
| PostgreSQL | 16 | Banco de dados relacional |
| Flyway | Boot-managed | Migrações SQL versionadas |
| MapStruct | 1.5.5.Final | Mapeamento Entity ↔ DTO |
| JJWT | 0.12.5 | Geração e validação de JWT |
| SpringDoc OpenAPI | 2.5.0+ | Documentação Swagger |
| Lombok | Boot-managed | Redução de boilerplate |

### Frontend

| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19.2.4 | Framework de UI |
| Next.js | 16.1.6 | App Router, SSR, roteamento |
| TypeScript | 5.7.3 | Tipagem estática |
| TanStack Query | 5.90.21+ | Cache de estado do servidor |
| Axios | 1.13.5 | Cliente HTTP |
| Zustand | 5.0.11 | Estado global de autenticação |
| React Hook Form | 7.54.1 | Gerenciamento de formulários |
| Zod | 3.24.1 | Validação de schemas |
| Tailwind CSS | 4.2.0 | Estilização utility-first |
| shadcn/ui | — | Biblioteca de componentes (Radix UI) |
| Recharts | 2.15.0 | Gráficos e visualizações |

### Infraestrutura (Docker Compose)

| Serviço | Imagem | Porta | Descrição |
|---|---|---|---|
| PostgreSQL | postgres:16-alpine | 5432 | Banco de dados |
| Redis | redis:7-alpine | 6379 | Rate limiting / cache (futuro) |
| Backend | build ./backend | 8080 | API REST Spring Boot |
| Swagger UI | swaggerapi/swagger-ui | 8090 | Documentação da API |

---

## Arquitetura

```
┌─────────────┐     HTTP      ┌──────────────────┐     JDBC     ┌────────────┐
│  Frontend   │ ────────────► │  Backend (API)   │ ───────────► │ PostgreSQL │
│  Next.js    │  :3000        │  Spring Boot     │  :8080       │            │
│             │ ◄──────────── │                  │ ◄─────────── │  :5432     │
└─────────────┘    JSON       │  JWT + RBAC      │              └────────────┘
                              │  Multi-Tenant    │
                              └──────────────────┘
                                      │
                              ┌───────┴───────┐
                              │    Redis      │
                              │    :6379      │
                              └───────────────┘
```

### Fluxo de requisição no backend

```
Request → JwtAuthFilter → @PreAuthorize → Controller → Service → Repository → PostgreSQL
                ↓                                          ↓
         TenantContext                              LimiteService
         (isolamento)                            (verificação de cota)
```

---

## Pré-requisitos

- **Docker** e **Docker Compose**
- **Java 21** e **Maven 3.9+** (desenvolvimento backend)
- **Node.js 18+** e **pnpm** (desenvolvimento frontend)

---

## Instalação e Configuração

### 1. Subir infraestrutura

```bash
docker-compose up -d
```

Inicia PostgreSQL, Redis, Backend e Swagger UI.

### 2. Backend (desenvolvimento local)

```bash
cd backend
mvn spring-boot:run
```

A API estará disponível em `http://localhost:8080/api`.

### 3. Frontend (desenvolvimento local)

```bash
cd frontend
pnpm install
pnpm generate:types   # gera tipos TypeScript a partir do OpenAPI
pnpm dev
```

O frontend estará disponível em `http://localhost:3000`.

### 4. Acessos

| Recurso | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API REST | http://localhost:8080/api |
| Swagger UI | http://localhost:8090 |

---

## Variáveis de Ambiente

### Backend (`application.properties` / env vars)

| Variável | Default | Descrição |
|---|---|---|
| `DB_USER` | postgres | Usuário do banco |
| `DB_PASSWORD` | admin | Senha do banco |
| `APP_JWT_SECRET` | (dev key) | Chave secreta para JWT (trocar em produção) |
| `APP_CORS_ALLOWED_ORIGINS` | http://localhost:3000 | Origens CORS permitidas |
| `APP_FRONTEND_URL` | http://localhost:3000 | URL do frontend (usado em e-mails) |
| `MAIL_USERNAME` | — | Conta Gmail para SMTP |
| `MAIL_PASSWORD` | — | App password do Gmail |

### Docker Compose

| Variável | Descrição |
|---|---|
| `JWT_SECRET` | Chave JWT passada ao backend |
| `CORS_ORIGINS` | Origens CORS (default: http://localhost:3000) |
| `FRONTEND_URL` | URL do frontend |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | Credenciais SMTP |

---

## Migrações de Banco de Dados

As migrações rodam automaticamente via **Flyway** ao iniciar o backend.

| Migração | Descrição |
|---|---|
| V1 | Tabela `planos` (planos de assinatura) |
| V2 | Tabela `tenants` (contas de vendedores) |
| V3 | Tabela `usuarios` (usuários do sistema) |
| V4 | Tabela `compradores` (clientes dos vendedores) |
| V5 | Tabela `produtos` |
| V6 | Tabela `pacotes` |
| V7 | Tabela `order_items` (itens dos pacotes) |
| V8 | Tabela `faixas_frete` (faixas de custo de frete) |
| V9 | Tabela `orcamentos` (simulações salvas) |
| V10 | Tabela `tokens_recuperacao_senha` |
| V11 | Inserção de faixas de frete padrão |
| V12 | Renomeação da categoria CAMISA → ROUPAS |

Comandos manuais:

```bash
cd backend
mvn flyway:migrate   # executar migrações
mvn flyway:info      # verificar status
```

---

## Endpoints da API

**Base URL:** `http://localhost:8080/api`

Todos os endpoints (exceto Auth) exigem o header `Authorization: Bearer <token>`.

A especificação completa está em `docs/openapi.yaml` e acessível via Swagger UI em `http://localhost:8090`.

### Autenticação (público)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Login (retorna token + dados do usuário) |
| POST | `/auth/cadastro/vendedor` | Cadastro de vendedor (cria tenant + trial PRO 14 dias) |
| POST | `/auth/cadastro/comprador` | Cadastro de comprador (requer código de convite) |
| POST | `/auth/recuperar-senha` | Solicitar recuperação de senha por e-mail |
| POST | `/auth/redefinir-senha` | Redefinir senha com token |

### Dashboard do Vendedor

| Método | Rota | Descrição |
|---|---|---|
| GET | `/vendedor/dashboard` | KPIs: receita pendente, lucro total, quantidade de pacotes, ticket médio, uso do plano |

### Compradores

| Método | Rota | Descrição |
|---|---|---|
| GET | `/vendedor/compradores` | Listar compradores do vendedor |
| POST | `/vendedor/compradores` | Criar comprador (verifica limite do plano) |
| GET | `/vendedor/compradores/{id}` | Detalhe do comprador |
| PUT | `/vendedor/compradores/{id}` | Atualizar comprador |
| DELETE | `/vendedor/compradores/{id}` | Remover comprador |
| POST | `/vendedor/compradores/{id}/convite` | Gerar código e link de convite para o portal |

### Produtos

| Método | Rota | Descrição |
|---|---|---|
| GET | `/vendedor/produtos` | Listar produtos (filtro opcional `?categoria=ROUPAS`) |
| POST | `/vendedor/produtos` | Criar produto (verifica limite do plano) |
| GET | `/vendedor/produtos/{id}` | Detalhe do produto |
| PUT | `/vendedor/produtos/{id}` | Atualizar produto |
| DELETE | `/vendedor/produtos/{id}` | Remover produto |
| POST | `/vendedor/produtos/{id}/foto` | Upload de foto (`multipart/form-data`, campo `foto`) |

### Pacotes

| Método | Rota | Descrição |
|---|---|---|
| GET | `/vendedor/pacotes` | Listar pacotes (filtro opcional `?status=RASCUNHO`) |
| POST | `/vendedor/pacotes` | Criar pacote (verifica limite do plano) |
| GET | `/vendedor/pacotes/{id}` | Detalhe completo do pacote |
| PUT | `/vendedor/pacotes/{id}` | Atualizar pacote (recalcula rateio se câmbio/taxa mudar) |
| PATCH | `/vendedor/pacotes/{id}/status` | Avançar status do pacote |
| GET | `/vendedor/pacotes/{id}/resumo-financeiro` | Resumo financeiro (custos, receitas, margem %) |
| GET | `/vendedor/pacotes/{id}/itens` | Itens agrupados por comprador |

### Itens do Pacote

| Método | Rota | Descrição |
|---|---|---|
| POST | `/vendedor/pacotes/{pacoteId}/itens` | Adicionar item (recalcula rateio) |
| PUT | `/vendedor/pacotes/{pacoteId}/itens/{itemId}` | Atualizar item (recalcula rateio) |
| DELETE | `/vendedor/pacotes/{pacoteId}/itens/{itemId}` | Remover item (recalcula rateio) |

### Frete

| Método | Rota | Descrição |
|---|---|---|
| GET | `/vendedor/frete/tabela` | Listar faixas de frete do vendedor |
| POST | `/vendedor/frete/tabela` | Criar faixa de frete (valida sobreposição) |
| POST | `/vendedor/frete/calcular` | Calcular frete para peso + tipo de envio |

### Orçamentos (Simulador)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/vendedor/orcamentos` | Listar simulações salvas |
| POST | `/vendedor/orcamentos` | Salvar simulação no banco |
| POST | `/vendedor/orcamentos/simular` | Simular custos (não persiste) |

### Conta

| Método | Rota | Descrição |
|---|---|---|
| GET | `/vendedor/conta/plano` | Informações do plano + uso de cotas |

### Portal do Comprador

| Método | Rota | Descrição |
|---|---|---|
| GET | `/portal/meus-pedidos` | Listar pedidos do comprador |
| GET | `/portal/meus-pedidos/{itemId}` | Detalhe de um pedido |

### Admin

| Método | Rota | Descrição |
|---|---|---|
| GET | `/admin/dashboard` | KPIs da plataforma (tenants, MRR, pacotes, compradores) |
| GET | `/admin/tenants` | Listar tenants (filtros `?plano=PRO&status=ATIVO`) |
| GET | `/admin/tenants/{id}` | Detalhe do tenant |
| PATCH | `/admin/tenants/{id}/suspender` | Suspender tenant |
| PATCH | `/admin/tenants/{id}/reativar` | Reativar tenant |
| PATCH | `/admin/tenants/{id}/plano` | Alterar plano do tenant |

---

## Estrutura do Projeto

```
ign-shipping/
├── docker-compose.yml          # Postgres, Redis, Backend, Swagger UI
├── docs/
│   ├── openapi.yaml            # Especificação OpenAPI 3.0.3
│   └── simulador-revisao.md    # Backlog do simulador
│
├── backend/                    # Spring Boot REST API
│   ├── pom.xml
│   └── src/main/
│       ├── java/br/com/ignshipping/
│       │   ├── config/         # SecurityConfig, CorsConfig, DataSeeder
│       │   ├── security/       # JwtAuthFilter, JwtUtils, TenantContext
│       │   ├── domain/
│       │   │   ├── entity/     # 10 entidades JPA
│       │   │   └── enums/      # Role, Categoria, StatusPacote, TipoEnvio, etc.
│       │   ├── repository/     # 10 repositórios JPA
│       │   ├── service/        # 11 serviços de negócio
│       │   ├── controller/     # 11 controllers REST
│       │   ├── dto/            # 40+ DTOs (Request/Response)
│       │   ├── mapper/         # Interfaces MapStruct
│       │   └── exception/      # GlobalExceptionHandler
│       └── resources/
│           ├── application.properties
│           └── db/migration/   # V1 a V12 (Flyway)
│
└── frontend/                   # Next.js (App Router)
    ├── package.json
    ├── app/
    │   ├── auth/               # Login, cadastro, recuperar/redefinir senha
    │   ├── vendedor/           # Dashboard, compradores, produtos, pacotes,
    │   │                       # simulador, frete, conta
    │   ├── portal/             # Meus pedidos, detalhe do pedido
    │   └── admin/              # Overview, tenants
    ├── components/
    │   ├── ui/                 # shadcn/ui (não editar)
    │   ├── shared/             # ProtectedRoute, AuthRedirect, StatusChip
    │   ├── vendedor/           # Componentes do vendedor
    │   ├── portal/             # Layout do portal
    │   └── admin/              # Layout do admin
    ├── services/               # 11 módulos de chamada à API
    ├── hooks/                  # Hooks por domínio (vendedor, portal, admin)
    ├── store/                  # Zustand (authStore)
    ├── lib/                    # Axios config, utils (formatBRL, formatYuan)
    └── src/types/              # api.generated.ts (gerado do OpenAPI)
```

---

## Multi-Tenancy e Segurança

### Isolamento de dados

Cada tabela de negócio possui `tenant_id` como chave estrangeira. O `TenantContext` (ThreadLocal) é preenchido automaticamente pelo `JwtAuthFilter` a partir do JWT e usado em todas as queries — nunca aceito via request.

### Autenticação JWT

O token contém `userId`, `tenantId`, `role` e `email`, com validade de 24 horas. O frontend armazena o token via Zustand (persistido em `localStorage`) e o envia em todas as requisições via interceptor Axios.

### Controle de acesso (RBAC)

| Role | Acesso |
|---|---|
| VENDEDOR | Dados do próprio tenant (compradores, produtos, pacotes, frete, simulador, conta) |
| COMPRADOR | Somente leitura dos próprios pedidos no portal |
| ADMIN | Acesso total à plataforma (sem filtro de tenant) |

### Senhas

- Hash com **BCrypt**
- Requisitos: mínimo 8 caracteres, 1 maiúscula, 1 dígito, 1 caractere especial
- Recuperação via token com validade de 24 horas

### CORS

Configurado para aceitar origens definidas em `APP_CORS_ALLOWED_ORIGINS` (default: `http://localhost:3000`). Rotas públicas: `/api/auth/**`, `/api-docs/**`, `/swagger-ui/**`.

---

## Algoritmo de Rateio de Frete

O rateio distribui proporcionalmente o custo total de frete entre todos os itens de um pacote com base no **peso**.

### Fórmula

```
Para cada item no pacote:
  pesoItem     = produto.pesoGramas × quantidade
  pesoTotal    = soma dos pesos de todos os itens
  proporção    = pesoItem / pesoTotal

  custoRateadoBrl = (freteInternacionalYuan + 30) × câmbio × proporção
```

- **30** = taxa fixa CSSBuy (¥)
- **câmbio** = taxa de conversão ¥ → R$
- **freteInternacionalYuan** = custo do frete internacional em ¥

### Exemplo

Pacote com 1000g total, frete ¥200, câmbio 0.75:

| Item | Peso | Proporção | Custo rateado (R$) |
|---|---|---|---|
| A | 400g | 40% | (200 + 30) × 0.75 × 0.4 = **69,00** |
| B | 300g | 30% | (200 + 30) × 0.75 × 0.3 = **51,75** |
| C | 300g | 30% | (200 + 30) × 0.75 × 0.3 = **51,75** |

### Quando o recálculo é disparado

- Adicionar, atualizar ou remover um item do pacote
- Alterar `câmbio` ou `taxaAlfandegáriaBrl` do pacote

---

### Status do pacote (fluxo)

```
RASCUNHO → AGUARDANDO_ENVIO → EM_VIAGEM → ALFÂNDEGA → TRÂNSITO → ENTREGUE → FINALIZADO
                                    └──────────────────────┘
                                  (pode pular ALFÂNDEGA → TRÂNSITO)
```

### Enums

| Enum | Valores |
|---|---|
| Role | VENDEDOR, COMPRADOR, ADMIN |
| Categoria | ROUPAS, TENIS, ELETRONICO, OUTROS |
| StatusPacote | RASCUNHO, AGUARDANDO_ENVIO, EM_VIAGEM, ALFANDEGA, TRANSITO, ENTREGUE, FINALIZADO |
| TipoEnvio | EXPRESSA, ECONOMICA |
| NomePlano | GRATUITO, BASICO, PRO, ENTERPRISE |
| StatusPagamento | PENDENTE, PAGO, PARCIAL |

---

## Licença

Projeto privado — todos os direitos reservados.
