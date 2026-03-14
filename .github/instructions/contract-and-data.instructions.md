---
description: "Use when changing OpenAPI contract, Flyway migrations, and runtime configuration files that couple backend and frontend."
applyTo:
  - "docs/openapi.yaml"
  - "backend/src/main/resources/application.properties"
  - "backend/src/main/resources/db/migration/**"
  - "docker-compose.yml"
  - "backend/compose.yaml"
---
# Contract And Data Instructions

## Area Purpose
- Define API schema as source of truth.
- Define relational schema evolution through Flyway migrations.
- Define local runtime wiring for backend/infrastructure.

## OpenAPI Contract Rules
- Keep `docs/openapi.yaml` aligned with actual backend controllers and DTOs.
- Keep enum values exactly synchronized with backend enums (`Role`, `Categoria`, `StatusPacote`, `TipoEnvio`, `NomePlano`, `StatusPagamento`).
- Keep endpoint groups and prefixes stable (`/auth`, `/vendedor`, `/portal`, `/admin` under API base).
- Keep response/error shapes compatible with backend `GlobalExceptionHandler` and frontend interceptors.

## Migration Rules
- Add new migration files only; do not modify existing `V1__...` through `V12__...` files.
- Keep migration naming convention `V{n}__descricao.sql` as in `backend/src/main/resources/db/migration/`.
- Keep DDL compatible with `spring.jpa.hibernate.ddl-auto=validate` in `application.properties`.
- Keep DB constraints aligned with enum/value expectations used by backend/frontend.

## Runtime Config Rules
- Keep required app properties and env placeholders stable in `application.properties` (`app.jwt.secret`, `app.cors.allowed-origins`, `app.frontend.url`, mail settings).
- Keep root `docker-compose.yml` as primary local orchestration entrypoint.
- Treat `backend/compose.yaml` as optional local helper and avoid drift from main root compose semantics unless intentionally coordinated.

## DO
- Do update OpenAPI first when introducing endpoint/request/response shape changes.
- Do regenerate frontend types after OpenAPI changes using `pnpm generate:types`.
- Do include migration changes whenever persistence structure changes.
- Do keep security scheme `BearerAuth` accurate for protected endpoints.

## DON'T
- Do not change contract field names casually; frontend services/hooks rely on generated names.
- Do not remove previously shipped migration files.
- Do not introduce config keys that duplicate existing ones with different names.
- Do not hardcode production secrets in tracked config files.

## Cross-Area Dependencies
- `docs/openapi.yaml` feeds `frontend/src/types/api.generated.ts`.
- Migration/sql/config changes affect backend startup, validation, and all API consumers.
