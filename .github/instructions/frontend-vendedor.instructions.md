---
description: "Use when changing seller (vendedor) dashboard, pacotes, compradores, produtos, frete, simulador, and related hooks/services/components."
applyTo:
  - "frontend/app/vendedor/**"
  - "frontend/components/vendedor/**"
  - "frontend/hooks/vendedor/**"
  - "frontend/services/compradorService.ts"
  - "frontend/services/contaService.ts"
  - "frontend/services/dashboardService.ts"
  - "frontend/services/freteService.ts"
  - "frontend/services/itemService.ts"
  - "frontend/services/orcamentoService.ts"
  - "frontend/services/pacoteService.ts"
  - "frontend/services/produtoService.ts"
---
# Frontend Vendedor Instructions

## Area Purpose
- Provide seller operations for package lifecycle, buyers, products, freight table, pricing simulation, and account usage.
- Surface business-critical freight allocation and profitability data from backend.

## Internal Architecture To Keep
- Keep route layouts wrapped by `frontend/app/vendedor/layout.tsx`.
- Keep global modal context in `frontend/hooks/vendedor/usePacoteDetalheModal.tsx` and mounted modal `frontend/components/vendedor/pacote-detalhe-modal.tsx`.
- Keep server-state orchestration with React Query hooks in `frontend/hooks/vendedor/**`.
- Keep API calls centralized in `frontend/services/*Service.ts` files.

## Key Query Keys And Invalidation Patterns
- Preserve core query keys:
- `['vendedor', 'dashboard']` in `useDashboard.ts`.
- `['vendedor', 'pacotes', ...]` in `usePacotes.ts`.
- `['vendedor', 'compradores']` in `useCompradores.ts`.
- `['vendedor', 'produtos', ...]` in `useProdutos.ts`.
- `['vendedor', 'frete', 'tabela']` in `useFrete.ts`.
- Preserve mutation invalidation coupling:
- Item mutations invalidate pacote detail/list/dashboard in `useItens.ts`.
- Pacote status mutation invalidates pacote detail/list/dashboard in `usePacotes.ts`.

## Concrete File Responsibilities
- `frontend/app/vendedor/dashboard/page.tsx`: KPI cards + filtered recent package table.
- `frontend/app/vendedor/pacotes/page.tsx`: package list/filter and package creation flow.
- `frontend/app/vendedor/compradores/page.tsx`: buyer CRUD + invite link generation.
- `frontend/app/vendedor/produtos/page.tsx`: product CRUD with category filters.
- `frontend/app/vendedor/frete/page.tsx`: freight range management and freight calculator.
- `frontend/app/vendedor/simulador/page.tsx`: local cost simulation + orçamento save.
- `frontend/app/vendedor/conta/page.tsx`: profile and plan usage visualization.
- `frontend/components/vendedor/status-chip.tsx` and `margem-bar.tsx`: canonical status/margin visual semantics.

## Business Constraints You Must Keep
- Keep enum values uppercase and API-compatible (`StatusPacote`, `StatusPagamento`, `Categoria`, `TipoEnvio`).
- Keep status progression UX aligned with backend transitions (no skipping invalid states).
- Keep monetary displays formatted via `formatBRL`/`formatYuan` from `frontend/lib/utils.ts`.
- Keep package detail modal dependent on three parallel queries in `usePacoteDetalhe.ts`.

## DO
- Do define request/response aliases from generated OpenAPI types in each service.
- Do use hooks for data access in pages; keep pages focused on UI/form interactions.
- Do invalidate affected caches after mutations instead of forcing full page reloads.
- Do keep Zod schemas near forms in page files when form complexity is page-specific.

## DON'T
- Do not hardcode financial formulas in multiple components; keep canonical calculations in simulator helpers and backend responses.
- Do not rename existing query keys casually; mutations depend on them for consistency.
- Do not bypass modal context by introducing independent package-detail states in multiple pages.
- Do not call endpoints from components directly; go through service modules.

## Cross-Area Dependencies
- Vendedor screens depend on backend endpoints under `/api/vendedor/**`.
- Package detail/status behavior must remain consistent with backend `PacoteService` and `OrderItemService`.
