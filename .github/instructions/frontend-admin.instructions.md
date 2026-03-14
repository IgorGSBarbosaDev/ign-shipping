---
description: "Use when changing admin panel pages, hooks, services, and admin layout for tenant operations."
applyTo:
  - "frontend/app/admin/**"
  - "frontend/components/admin/**"
  - "frontend/hooks/admin/**"
  - "frontend/services/adminService.ts"
---
# Frontend Admin Instructions

## Area Purpose
- Provide platform-level tenant operations for ADMIN role.
- Display global SaaS KPIs and enable tenant lifecycle actions.

## Files And Roles
- `frontend/app/admin/overview/page.tsx`: admin KPIs and recent tenant table.
- `frontend/app/admin/tenants/page.tsx`: tenant list, filters, search, suspend/reactivate/plan change dialogs.
- `frontend/app/admin/tenants/[id]/page.tsx`: tenant detail and management actions.
- `frontend/components/admin/admin-layout.tsx`: admin sidebar/topbar, collapse persistence, logout.
- `frontend/hooks/admin/useAdminDashboard.ts`: dashboard poll (`refetchInterval: 60_000`).
- `frontend/hooks/admin/useAdminTenants.ts`: list/detail queries and mutation invalidation.
- `frontend/services/adminService.ts`: typed API layer for `/admin/**` endpoints.

## Query And Mutation Conventions
- Keep query keys rooted at `['admin', ...]`.
- Keep invalidation targets after admin mutations:
- `['admin', 'tenants']`
- `['admin', 'dashboard']`
- Keep mutation composition in hooks, not directly in page components.

## UI/Behavior Constraints
- Keep action confirmation flows for destructive operations using `AlertDialog`.
- Keep plan changes explicit via select + save action.
- Keep tenant status/plano badge color maps in admin pages for consistency.
- Keep tenant detail path semantics `/admin/tenants/[id]` and back navigation links.

## DO
- Do type service responses from generated OpenAPI `paths` in `adminService.ts`.
- Do keep `NomePlano` and `StatusConta` constrained unions from API types.
- Do preserve list filters (`plano`, `status`) and client search behavior.
- Do keep admin layout protection through `frontend/app/admin/layout.tsx` + `ProtectedRoute`.

## DON'T
- Do not expose admin actions in non-admin areas.
- Do not bypass mutation hooks with direct service calls inside deeply nested UI controls.
- Do not remove confirmation dialogs for suspend/reactivate actions.
- Do not convert tenant identifiers to string-only handling when APIs expect numeric IDs.

## Cross-Area Dependencies
- Admin routes depend on backend `AdminController` endpoints under `/api/admin/**`.
- Auth routing must continue sending `ADMIN` users to `/admin/overview`.
