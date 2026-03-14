---
description: "Use when creating new directories/modules in this monorepo. Enforce established backend/frontend module structure and integration rules."
applyTo: "**"
---
# New Module Instructions

## Purpose
- Standardize new modules to match current IGN Shipping architecture.
- Avoid introducing patterns that bypass existing service, typing, and security layers.

## When Creating A New Backend Module
- Place code under `backend/src/main/java/br/com/ignshipping/`.
- Follow this structure:
- `controller/{area}/NewResourceController.java`
- `service/NewResourceService.java`
- `repository/NewResourceRepository.java`
- `domain/entity/NewResource.java`
- `dto/{area}/NewResourceRequest.java` and `NewResourceResponse.java`
- Keep controller thin and call service methods.
- Keep persistence/queries in repository only.
- Add `@PreAuthorize` on secured controller classes or methods.
- Read tenant from `TenantContext.getCurrentTenant()` for vendor-scoped resources.
- Register schema changes via `backend/src/main/resources/db/migration/V{n}__*.sql`.

## When Creating A New Frontend Domain Module
- Place route files under `frontend/app/{area}/.../page.tsx`.
- Create service wrapper under `frontend/services/*Service.ts` first.
- Create hook wrapper under `frontend/hooks/{area}/use*.ts` using React Query.
- Use generated OpenAPI types (`components` or `paths`) in service signatures.
- Use page-level forms with `react-hook-form` + `zodResolver` when validation is needed.
- Use shared primitives from `frontend/components/ui/*` and shared helpers from `frontend/lib/utils.ts`.

## Naming And Query-Key Conventions
- Use Portuguese domain naming aligned with existing code (`comprador`, `pacote`, `orcamento`).
- Use query keys prefixed by area:
- `['vendedor', ...]`
- `['portal', ...]`
- `['admin', ...]`
- Invalidate related keys on mutation success instead of reloading pages.

## New Shared UI/Utility Modules
- Add domain-agnostic reusable pieces in:
- `frontend/components/shared/**` for cross-domain components.
- `frontend/lib/**` for utility functions.
- `frontend/providers/**` for app-wide context/providers.
- Keep `frontend/components/ui/**` reserved for primitive component abstractions.

## DO
- Do update `docs/openapi.yaml` and regenerate frontend types when API shape changes.
- Do wire new secured pages through existing layout/guard flow.
- Do keep error responses compatible with backend `GlobalExceptionHandler` and frontend `api.ts` interceptor handling.
- Do add focused area instructions if a new module becomes a major domain.

## DON'T
- Do not create backend modules that read tenant from request payload.
- Do not call APIs directly in page components without service/hook layers.
- Do not manually edit `frontend/src/types/api.generated.ts`.
- Do not create parallel architectural stacks (new state manager, new API client, new auth flow) unless explicitly requested.
