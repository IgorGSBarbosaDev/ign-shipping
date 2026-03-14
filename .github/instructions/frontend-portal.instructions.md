---
description: "Use when changing buyer portal pages, portal layout, and portal hooks/services for order tracking."
applyTo:
  - "frontend/app/portal/**"
  - "frontend/components/portal/**"
  - "frontend/hooks/portal/**"
  - "frontend/services/portalService.ts"
---
# Frontend Portal Instructions

## Area Purpose
- Provide comprador-facing order list and order detail tracking experience.
- Present payment and shipping progress with readable status labels and timeline.

## Files And Roles
- `frontend/app/portal/meus-pedidos/page.tsx`: list page with KPI cards, status filters, and card grid.
- `frontend/app/portal/pedidos/[itemId]/page.tsx`: order detail page with timeline and purchase details.
- `frontend/components/portal/portal-layout.tsx`: top navigation, buyer identity, logout action.
- `frontend/hooks/portal/useMeusPedidos.ts`: portal query hooks and query keys.
- `frontend/services/portalService.ts`: `/portal/meus-pedidos` endpoint wrappers.

## Patterns To Preserve
- Keep query keys:
- `['portal', 'meus-pedidos']`
- `['portal', 'pedido', itemId]`
- Keep `refetchOnWindowFocus: true` and short stale windows for portal freshness (`useMeusPedidos.ts`).
- Keep friendly status maps and badge styles in page-level constants.
- Keep route navigation based on item ID in list -> detail flow.

## DO
- Do keep pages wrapped with `PortalLayout` for consistent navbar/logout behavior.
- Do keep formatting centralized through `formatBRL` and `formatDate`.
- Do keep status fallback behavior when API fields are null/undefined.
- Do keep mobile-friendly card-first layout for `meus-pedidos`.

## DON'T
- Do not expose seller-only fields/actions in portal screens.
- Do not mutate order/payment state from portal UI; this area is read-oriented.
- Do not replace typed service calls with ad-hoc endpoint strings inside pages.
- Do not change timeline status order without coordinating backend enum flow.

## Cross-Area Dependencies
- Portal data contracts come from OpenAPI-generated types and backend `/api/portal/**` endpoints.
- Auth role routing from `ProtectedRoute` and `AuthRedirect` must continue to send COMPRADOR users here.
