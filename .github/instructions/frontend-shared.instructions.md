---
description: "Use when changing shared frontend infrastructure: API client, global providers, shared components, utilities, generated types, and UI primitives."
applyTo:
  - "frontend/lib/**"
  - "frontend/providers/**"
  - "frontend/store/**"
  - "frontend/components/shared/**"
  - "frontend/components/ui/**"
  - "frontend/components/theme-provider.tsx"
  - "frontend/app/layout.tsx"
  - "frontend/app/page.tsx"
  - "frontend/app/globals.css"
  - "frontend/src/types/**"
---
# Frontend Shared Instructions

## Area Purpose
- Centralize API client behavior, authentication persistence, global providers, and reusable UI building blocks.
- Provide shared formatting/utility functions used across all domains.

## Critical Files And Responsibilities
- `frontend/lib/api.ts`: Axios instance, JWT request interceptor, global 401/422 response handling.
- `frontend/lib/utils.ts`: `cn`, currency/date/percent formatters.
- `frontend/store/authStore.ts`: persisted auth state and hydration behavior.
- `frontend/providers/QueryProvider.tsx`: `QueryClient` defaults (`staleTime`, `retry`).
- `frontend/components/shared/ProtectedRoute.tsx`: role authorization gate.
- `frontend/components/shared/AuthRedirect.tsx`: root role redirect.
- `frontend/components/theme-provider.tsx`: theme setup via `next-themes`.
- `frontend/app/layout.tsx`: root providers wiring and app metadata.
- `frontend/app/globals.css`: Tailwind v4 theme tokens and CSS variables.
- `frontend/src/types/api.generated.ts`: generated OpenAPI TS contracts.

## Required Shared Patterns
- Keep import aliasing style with `@/` paths.
- Keep API typing sourced from generated `components`/`paths` types.
- Keep 422 validation normalization shape in `api.ts` (`validationErrors[field] = string[]`).
- Keep `logout` + redirect behavior on 401 in `api.ts`.
- Keep `skipHydration: true` and explicit rehydrate calls where route checks depend on persisted state.

## UI Primitive Constraints
- Treat `frontend/components/ui/**` as shadcn/ui primitive layer.
- Keep primitive components generic and domain-agnostic.
- Keep tailwind token usage compatible with `frontend/app/globals.css` variables.

## DO
- Do add new reusable helpers to `frontend/lib/utils.ts` only when they are cross-domain.
- Do update providers centrally in `frontend/app/layout.tsx`.
- Do preserve lightweight root home page role (`frontend/app/page.tsx`) as entry navigation.
- Do regenerate `frontend/src/types/api.generated.ts` through script, not manual edits.

## DON'T
- Do not hardcode `fetch` wrappers per page when `frontend/lib/api.ts` already handles auth/error conventions.
- Do not embed business-domain logic inside `components/ui/*` primitives.
- Do not manually edit `frontend/src/types/api.generated.ts`.
- Do not change auth store key names (`ign-auth`) or theme key (`ign-theme`) without migration strategy.

## Cross-Area Dependencies
- All domain hooks/services depend on this area for API, auth, and query-provider behavior.
- OpenAPI contract changes in `docs/openapi.yaml` require regenerated types consumed by this area.
