---
description: "Use when changing Spring Boot backend code under backend/. Covers tenant isolation, controllers/services/repositories, Flyway, and exception handling in IGN Shipping."
applyTo: "backend/**"
---
# Backend Instructions

## Area Purpose
- Implement the REST API for auth, vendedor, portal comprador, and admin domains.
- Enforce JWT authentication, role authorization, and multi-tenant isolation.
- Persist domain entities in PostgreSQL with Flyway-managed schema.

## Architecture You Must Preserve
- Keep package root `br.com.ignshipping` (`backend/src/main/java/br/com/ignshipping/`).
- Keep layered flow: controller -> service -> repository -> entity.
- Keep security flow configured in:
- `backend/src/main/java/br/com/ignshipping/config/SecurityConfig.java`
- `backend/src/main/java/br/com/ignshipping/security/JwtAuthFilter.java`
- `backend/src/main/java/br/com/ignshipping/security/JwtUtils.java`
- Keep exception mapping centralized in `backend/src/main/java/br/com/ignshipping/exception/GlobalExceptionHandler.java`.

## Core Files And Roles
- `backend/src/main/java/br/com/ignshipping/controller/AuthController.java`: public auth endpoints.
- `backend/src/main/java/br/com/ignshipping/controller/vendedor/PacoteController.java`: pacote CRUD/status/resumo endpoints.
- `backend/src/main/java/br/com/ignshipping/controller/admin/AdminController.java`: admin dashboard and tenant management.
- `backend/src/main/java/br/com/ignshipping/service/AuthService.java`: login/cadastro/recuperacao/redefinicao de senha.
- `backend/src/main/java/br/com/ignshipping/service/PacoteService.java`: pacote lifecycle and status transition validation.
- `backend/src/main/java/br/com/ignshipping/service/OrderItemService.java`: rateio recalculation and grouped item responses.
- `backend/src/main/java/br/com/ignshipping/service/LimiteService.java`: plan limit checks.
- `backend/src/main/java/br/com/ignshipping/security/TenantContext.java`: tenant thread-local context.

## Mandatory Domain Patterns
- Read tenant ID from `TenantContext.getCurrentTenant()` inside protected controllers/services.
- Gate vendor/admin endpoints with `@PreAuthorize` in controllers.
- Keep enum values aligned with DB/OpenAPI (`Role`, `StatusPacote`, `TipoEnvio`, etc.).
- Use `BigDecimal` for monetary calculations.
- Keep status transitions validated by `PacoteService.TRANSICOES_VALIDAS`.

## Rateio And Financial Rules
- Keep the fixed CSSBuy fee in yuan in `OrderItemService` (`TAXA_CSSBUY_YUAN = 30.00`).
- Keep recalculation trigger behavior in:
- `OrderItemService.adicionarItem(...)`
- `OrderItemService.atualizarItem(...)`
- `OrderItemService.removerItem(...)`
- `PacoteService.atualizar(...)` when `cambio` or `taxaAlfandegariaBrl` changes.
- Keep cost/lucro response calculations centralized in service helpers (`toOrderItemResponseComPeso`, `calcularCustoTotalBrl`, `calcularMargem`).

## DO
- Do add new backend features by following existing folders: `controller`, `service`, `repository`, `dto`, `domain`, `exception`.
- Do validate input with Jakarta validation annotations on request DTOs and `@Valid` in controllers.
- Do throw domain exceptions (`ResourceNotFoundException`, `BusinessException`, `LimitePlanoExcedidoException`) rather than generic runtime exceptions.
- Do keep auth token generation through `JwtUtils.generateToken(...)` as used by `AuthService.buildLoginResponse(...)`.
- Do keep plan checks in create flows, for example `PacoteService.criar(...)` calling `limiteService.verificarLimitePacotesMes(...)`.
- Do add DB changes as new Flyway migration files in `backend/src/main/resources/db/migration/`.

## DON'T
- Do not accept tenant identifiers from request body/query/path for vendor-scoped operations.
- Do not bypass `GlobalExceptionHandler` by returning custom ad-hoc error formats from controllers.
- Do not edit existing migration files `V1..V12`; add a new `V{n}__*.sql` instead.
- Do not change endpoint prefixes (`/api/auth`, `/api/vendedor`, `/api/portal`, `/api/admin`) without updating contract and frontend.
- Do not return entities directly from controllers; keep DTO-based responses.
- Do not use floating-point types for money math.

## Cross-Area Dependencies
- Backend contract drives frontend types from `docs/openapi.yaml` -> `frontend/src/types/api.generated.ts`.
- Backend auth response shape must remain compatible with `frontend/services/authService.ts` and `frontend/store/authStore.ts`.
