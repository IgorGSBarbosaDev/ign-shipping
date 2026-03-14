# IGN Shipping Monorepo Instructions

## Scope
- Apply these rules to all code unless a more specific `.github/instructions/*.instructions.md` file overrides them.
- Keep changes minimal, compile-safe, and aligned with existing architecture.

## Stack And Versions
- Use Java `21` for backend code (`backend/pom.xml`).
- Use Spring Boot `4.0.3` and Maven for backend (`backend/pom.xml`).
- Use PostgreSQL `16` and Flyway migrations (`backend/src/main/resources/db/migration/`).
- Use Next.js `16.1.6`, React `19.2.4`, TypeScript `5.7.3`, and TanStack Query `5.x` for frontend (`frontend/package.json`).
- Use Tailwind CSS `4` and shadcn/ui-style components (`frontend/components.json`, `frontend/app/globals.css`).
- Use OpenAPI as contract source (`docs/openapi.yaml`) and generated frontend types (`frontend/src/types/api.generated.ts`).

## Monorepo Model
- Treat this repository as a plain two-app monorepo.
- Do not assume Turborepo, Nx, pnpm workspaces, or lerna.
- Use app-local package/build tools:
- Backend lives in `backend/` and uses Maven.
- Frontend lives in `frontend/` and uses pnpm scripts.
- Root `docker-compose.yml` orchestrates infra and backend container.

## Structure
- Backend app: `backend/src/main/java/br/com/ignshipping/**`
- Backend resources: `backend/src/main/resources/**`
- Frontend app routes: `frontend/app/**`
- Frontend shared layers: `frontend/services/**`, `frontend/hooks/**`, `frontend/components/**`, `frontend/lib/**`, `frontend/store/**`, `frontend/providers/**`
- API contract: `docs/openapi.yaml`

## Shared Coding Conventions
- Keep naming in Portuguese where existing code already uses Portuguese domain terms (for example `comprador`, `orcamento`, `pacote`).
- Keep role/status enum values exact and uppercase (`VENDEDOR`, `COMPRADOR`, `ADMIN`, etc.) to match API and DB constraints.
- Keep error handling explicit and user-safe:
- Backend maps domain exceptions through `backend/src/main/java/br/com/ignshipping/exception/GlobalExceptionHandler.java`.
- Frontend service calls rely on `frontend/lib/api.ts` interceptors for `401` and `422` handling.
- Preserve multi-tenant isolation rules:
- Backend tenant context must come from JWT/TenantContext, never from arbitrary request payload fields.
- Preserve query-cache invalidation patterns in frontend hooks after mutations.
- Prefer strongly typed APIs using OpenAPI-generated types from `frontend/src/types/api.generated.ts`.

## Run, Test, Build
- Root docker stack:
```bash
cd c:\Users\Igor\Documents\Monorepos\ign-shipping
docker-compose up -d
```
- Backend dev:
```bash
cd backend
./mvnw spring-boot:run
```
- Backend test:
```bash
cd backend
./mvnw test
```
- Backend build:
```bash
cd backend
./mvnw clean package
```
- Frontend install/dev:
```bash
cd frontend
pnpm install
pnpm generate:types
pnpm dev
```
- Frontend lint/build:
```bash
cd frontend
pnpm lint
pnpm build
```

## Global DO
- Do align frontend endpoints with `docs/openapi.yaml`.
- Do regenerate `frontend/src/types/api.generated.ts` after OpenAPI changes.
- Do keep role-based route protection consistent with `frontend/components/shared/ProtectedRoute.tsx`.
- Do keep backend endpoint prefixes and area segmentation (`/api/auth`, `/api/vendedor`, `/api/portal`, `/api/admin`).
- Do prefer adding focused instructions in area files instead of bloating global rules.

## Global DON'T
- Do not edit generated or build output files directly:
- `frontend/src/types/api.generated.ts`
- `backend/target/**`
- `frontend/.next/**`
- `frontend/node_modules/**`
- Do not introduce a new monorepo orchestrator (Nx/Turbo/workspaces) unless explicitly requested.
- Do not bypass backend exception mapping by returning ad-hoc error payload shapes from controllers.
- Do not hardcode tenant IDs or role assumptions.
- Do not replace existing React Query + service-layer patterns with ad-hoc fetch logic in pages.

## Creating new modules
Before creating any new folder or module, please read:
[new-module instructions](.github/instructions/new-module.instructions.md)
