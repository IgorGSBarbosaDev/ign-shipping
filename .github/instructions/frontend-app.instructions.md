---
description: "Use when changing Next.js App Router structure, top-level app layouts, and cross-domain routing in frontend/app."
applyTo: "frontend/app/**"
---
# Frontend App Router Instructions

## Area Purpose
- Organize route groups for auth, vendedor, portal, and admin in Next.js App Router.
- Compose global providers and domain layouts around protected routes.

## Routing Structure You Must Preserve
- Keep public auth routes under `frontend/app/auth/**`.
- Keep seller routes under `frontend/app/vendedor/**`.
- Keep buyer portal routes under `frontend/app/portal/**`.
- Keep admin routes under `frontend/app/admin/**`.
- Keep root layout in `frontend/app/layout.tsx` as provider composition entrypoint.

## Layout And Guard Composition
- Keep `frontend/app/admin/layout.tsx` wrapping children with `ProtectedRoute` and `AdminLayout`.
- Keep `frontend/app/vendedor/layout.tsx` wrapping children with `ProtectedRoute`, `PacoteDetalheProvider`, and `PacoteDetalheModalGlobal`.
- Keep portal pages using `PortalLayout` and COMPRADOR routing assumptions.

## DO
- Do add new pages as `page.tsx` within existing route groups.
- Do keep page components focused on UI and hook orchestration.
- Do keep redirection conventions compatible with `AuthRedirect` and `ProtectedRoute`.

## DON'T
- Do not move role domains into mixed folders that break current path prefixes.
- Do not introduce duplicate auth guards per page when layout-level protection exists.
- Do not swap App Router patterns back to pages-router patterns.

## Cross-Area Dependencies
- Route guards depend on `frontend/store/authStore.ts` hydration and token state.
- Domain pages depend on hooks/services and generated API types.
