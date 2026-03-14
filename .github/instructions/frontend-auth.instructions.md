---
description: "Use when changing login/signup/password recovery flows in Next.js auth pages, auth services, and auth store."
applyTo:
  - "frontend/app/auth/**"
  - "frontend/components/shared/AuthRedirect.tsx"
  - "frontend/components/shared/ProtectedRoute.tsx"
  - "frontend/components/shared/PasswordStrengthBar.tsx"
  - "frontend/services/authService.ts"
  - "frontend/store/authStore.ts"
  - "frontend/hooks/usePasswordStrength.ts"
---
# Frontend Auth Instructions

## Area Purpose
- Implement authentication and account onboarding UIs.
- Persist authenticated user/token in client state.
- Redirect users to role-specific areas after login/cadastro.

## Files You Must Anchor To
- `frontend/app/auth/login/page.tsx`: login form, auth error handling, role redirect.
- `frontend/app/auth/cadastro/page.tsx`: two-step seller/buyer signup with Zod schemas.
- `frontend/app/auth/recuperar-senha/page.tsx`: silent-success recovery request UX.
- `frontend/app/auth/redefinir-senha/page.tsx`: token-based password reset flow.
- `frontend/services/authService.ts`: typed API calls for auth endpoints.
- `frontend/store/authStore.ts`: Zustand persisted auth store (`name: 'ign-auth'`, `skipHydration: true`).
- `frontend/components/shared/ProtectedRoute.tsx`: route-level role guard.
- `frontend/components/shared/AuthRedirect.tsx`: root redirection based on role.

## Auth State And Redirect Rules
- Keep `UsuarioResumoResponse.role` as exact union `'VENDEDOR' | 'COMPRADOR' | 'ADMIN'`.
- Keep redirect targets consistent:
- `VENDEDOR` -> `/vendedor/dashboard`
- `COMPRADOR` -> `/portal/meus-pedidos`
- `ADMIN` -> `/admin/overview`
- Keep `useAuthStore.persist.rehydrate()` calls in route-guard/redirect components.

## Validation And Error Handling Rules
- Keep form validation with `react-hook-form` + `zodResolver`.
- Keep password complexity checks matching current schemas in cadastro/redefinir pages.
- Keep 401 handling for invalid credentials in login page.
- Keep 422 validation aggregation behavior from `frontend/lib/api.ts` for field errors.
- Keep recovery flow non-enumerating: recovery page must not reveal whether email exists.

## DO
- Do add new auth inputs to Zod schemas first, then map to generated request types in `authService.ts`.
- Do keep API typing based on `components['schemas'][...]` from generated types.
- Do store only token and resumo do usuario in `authStore`.
- Do keep UI role-routing logic centralized in one place per flow (`onSubmit` switch blocks).

## DON'T
- Do not call backend auth endpoints directly from pages with `fetch`; use `frontend/services/authService.ts`.
- Do not add tenant selection fields to auth forms; tenant is derived by backend for vendedor/comprador flows.
- Do not bypass `ProtectedRoute` with ad-hoc checks inside each protected page.
- Do not weaken password validation regex rules unless backend contract changes first.

## Cross-Area Dependencies
- Auth endpoints must remain aligned with backend `AuthController` and `AuthService`.
- Route guards here protect area layouts in `frontend/app/admin/layout.tsx` and `frontend/app/vendedor/layout.tsx`.
