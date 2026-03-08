# IGN Shipping — Frontend Copilot Instructions

## What is this project?

IGN Shipping is a **multi-tenant SaaS** for managing informal imports from China to Brazil. The frontend is a **React SPA** with three isolated areas:

| Area | Path prefix | User |
|---|---|---|
| Vendor area | `/vendedor/*` | Subscribing vendor (VENDEDOR) |
| Buyer portal | `/portal/*` | End buyer (COMPRADOR) |
| Admin panel | `/admin/*` | Platform operator (ADMIN) |

The backend API contract is at `../docs/openapi.yaml`. Generated TypeScript types from it are the source of truth for all data shapes.

---

## Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| TypeScript | 5 | Type safety |
| Next | 14+ | Fullstack React framework (App Router, SSR, routing, bundling) |
| TanStack Query (React Query) | 5 | Server state, caching, mutations |
| Axios | 1+ | HTTP client |
| Zustand | 4 | Auth global state (persisted) |
| React Hook Form | 7 | Form state |
| Zod | 3 | Schema validation |
| `@hookform/resolvers` | 3 | Bridge between RHF and Zod |
| Tailwind CSS | 3 | Utility-first styling |
| shadcn/ui | latest | Component library (built on Radix UI) |
| lucide-react | 0.4+ | Icons |
| `openapi-typescript` | 7 | Generates `src/types/api.generated.ts` from OpenAPI YAML |
| `clsx` + `tailwind-merge` | latest | Class merging utility |

---

## Project Structure

```
src/
├── types/
│   └── api.generated.ts        ← Auto-generated from ../docs/openapi.yaml — do NOT edit manually
├── lib/
│   ├── api.ts                  ← Axios instance with JWT interceptor + 401 handler
│   └── utils.ts                ← cn(), formatBRL(), formatYuan(), formatPercent(), formatDate()
├── store/
│   └── authStore.ts            ← Zustand store with persist (key: 'ign-auth')
├── hooks/
│   ├── usePasswordStrength.ts  ← Password strength score (0–4) + requirement checks
│   ├── vendedor/
│   │   ├── useDashboard.ts
│   │   ├── useCompradores.ts
│   │   ├── useProdutos.ts
│   │   ├── usePacotes.ts
│   │   ├── usePacoteDetalhe.ts
│   │   ├── useItens.ts
│   │   ├── useFrete.ts
│   │   └── useOrcamento.ts
│   └── portal/
│       └── useMeusPedidos.ts
├── services/
│   ├── authService.ts
│   ├── dashboardService.ts
│   ├── compradorService.ts
│   ├── produtoService.ts
│   ├── pacoteService.ts
│   ├── itemService.ts
│   ├── freteService.ts
│   ├── orcamentoService.ts
│   ├── contaService.ts
│   ├── portalService.ts
│   └── adminService.ts
├── components/
│   ├── ui/                     ← shadcn/ui components — never edit these files
│   ├── layouts/
│   │   ├── VendedorLayout.tsx  ← Sidebar + topbar for vendor area
│   │   ├── PortalLayout.tsx    ← Minimal navbar for buyer portal
│   │   └── AdminLayout.tsx     ← Sidebar for admin panel
│   └── shared/
│       ├── ProtectedRoute.tsx  ← Role-based route guard
│       ├── AuthRedirect.tsx    ← Redirects by role after login
│       ├── StatusChip.tsx      ← Colored badge for StatusPacote / StatusPagamento
│       ├── MargemBar.tsx       ← Progress bar: <15% red, 15–25% yellow, >25% green
│       ├── AvatarStack.tsx     ← Initials-based avatar stack with +N overflow
│       ├── CurrencyDisplay.tsx ← Formats BRL or ¥ Yuan
│       ├── PasswordStrengthBar.tsx ← 4-segment bar + checklist
│       └── PacoteDetalheModal.tsx  ← Central package detail modal (timeline, financials, items)
├── pages/
│   ├── auth/
│   │   ├── Login.tsx
│   │   ├── Cadastro.tsx        ← 2-step: select account type → fill form
│   │   ├── RecuperarSenha.tsx
│   │   └── RedefinirSenha.tsx
│   ├── vendedor/
│   │   ├── Dashboard.tsx
│   │   ├── Pacotes.tsx
│   │   ├── Compradores.tsx
│   │   ├── Produtos.tsx
│   │   ├── SimuladorCusto.tsx
│   │   ├── TabelaFrete.tsx
│   │   └── Conta.tsx
│   ├── portal/
│   │   ├── MeusPedidos.tsx
│   │   └── DetalhePedido.tsx
│   └── admin/
│       ├── Overview.tsx
│       ├── Tenants.tsx
│       └── TenantDetalhe.tsx
└── App.tsx                     ← Route definitions
```

---

## Routing

```tsx
// App.tsx — complete route map
<Routes>
  {/* Public */}
  <Route path="/auth/login"           element={<Login />} />
  <Route path="/auth/cadastro"        element={<Cadastro />} />
  <Route path="/auth/recuperar-senha" element={<RecuperarSenha />} />
  <Route path="/auth/redefinir-senha" element={<RedefinirSenha />} />

  {/* Vendor — role VENDEDOR */}
  <Route element={<ProtectedRoute allowedRoles={['VENDEDOR']} />}>
    <Route element={<VendedorLayout />}>
      <Route path="/vendedor/dashboard"   element={<Dashboard />} />
      <Route path="/vendedor/pacotes"     element={<Pacotes />} />
      <Route path="/vendedor/compradores" element={<Compradores />} />
      <Route path="/vendedor/produtos"    element={<Produtos />} />
      <Route path="/vendedor/simulador"   element={<SimuladorCusto />} />
      <Route path="/vendedor/frete"       element={<TabelaFrete />} />
      <Route path="/vendedor/conta"       element={<Conta />} />
    </Route>
  </Route>

  {/* Buyer portal — role COMPRADOR */}
  <Route element={<ProtectedRoute allowedRoles={['COMPRADOR']} />}>
    <Route element={<PortalLayout />}>
      <Route path="/portal/meus-pedidos"       element={<MeusPedidos />} />
      <Route path="/portal/pedidos/:itemId"    element={<DetalhePedido />} />
    </Route>
  </Route>

  {/* Admin — role ADMIN */}
  <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
    <Route element={<AdminLayout />}>
      <Route path="/admin/overview"       element={<Overview />} />
      <Route path="/admin/tenants"        element={<Tenants />} />
      <Route path="/admin/tenants/:id"    element={<TenantDetalhe />} />
    </Route>
  </Route>

  {/* Smart redirect after login */}
  <Route path="/" element={<AuthRedirect />} />
</Routes>
```

### ProtectedRoute behavior

```tsx
// If not authenticated → redirect to /auth/login
// If authenticated but wrong role → redirect to that user's home area
// If authenticated and correct role → render <Outlet />
function ProtectedRoute({ allowedRoles }: { allowedRoles: Role[] }) {
  const { usuario, isAuthenticated } = useAuthStore();
  if (!isAuthenticated()) return <Navigate to="/auth/login" replace />;
  if (!allowedRoles.includes(usuario!.role)) {
    // redirect to the user's correct area
    const home = { VENDEDOR: '/vendedor/dashboard', COMPRADOR: '/portal/meus-pedidos', ADMIN: '/admin/overview' };
    return <Navigate to={home[usuario!.role]} replace />;
  }
  return <Outlet />;
}
```

---

## Auth Store (Zustand)

```typescript
// store/authStore.ts
interface UsuarioResumoResponse {
  id: number;
  nome: string;
  email: string;
  role: 'VENDEDOR' | 'COMPRADOR' | 'ADMIN';
  tenantId: number | null;  // null for ADMIN
}

interface AuthState {
  token: string | null;
  usuario: UsuarioResumoResponse | null;
  setAuth: (token: string, usuario: UsuarioResumoResponse) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      usuario: null,
      setAuth: (token, usuario) => set({ token, usuario }),
      logout: () => set({ token: null, usuario: null }),
      isAuthenticated: () => !!get().token && !!get().usuario,
    }),
    { name: 'ign-auth' }
  )
);
```

---

## Axios Instance

```typescript
// lib/api.ts
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
});

// Attach JWT to every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
```

---

## TypeScript Types

Generated types live in `src/types/api.generated.ts`. Always use them:

```typescript
// Regenerate after any OpenAPI contract change:
// npx openapi-typescript ../docs/openapi.yaml -o src/types/api.generated.ts

// Usage
import type { components } from '../types/api.generated';

type PacoteResumoResponse   = components['schemas']['PacoteResumoResponse'];
type PacoteDetalheResponse  = components['schemas']['PacoteDetalheResponse'];
type OrderItemRequest       = components['schemas']['OrderItemRequest'];
type CompradorResponse      = components['schemas']['CompradorResponse'];
type DashboardVendedorResponse = components['schemas']['DashboardVendedorResponse'];
// etc.
```

**Never define manual interfaces** that duplicate generated types.

---

## TanStack Query Patterns

### Query defaults

```typescript
// main.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      retry: 1,
    },
  },
});
```

### Standard hook pattern

```typescript
// hooks/vendedor/useCompradores.ts
export function useCompradores() {
  const query = useQuery({
    queryKey: ['compradores'],
    queryFn: compradorService.listar,
  });

  const criar = useMutation({
    mutationFn: compradorService.criar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['compradores'] }),
  });

  const atualizar = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CompradorRequest }) =>
      compradorService.atualizar(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['compradores'] }),
  });

  const deletar = useMutation({
    mutationFn: compradorService.deletar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['compradores'] }),
  });

  return { ...query, criar, atualizar, deletar };
}
```

### Package detail — 3 parallel lazy queries

```typescript
// hooks/vendedor/usePacoteDetalhe.ts
export function usePacoteDetalhe(pacoteId: number | null) {
  const enabled = pacoteId !== null;

  const detalhe = useQuery({
    queryKey: ['pacote', pacoteId],
    queryFn: () => pacoteService.buscarDetalhe(pacoteId!),
    enabled,
  });

  const itens = useQuery({
    queryKey: ['pacote', pacoteId, 'itens'],
    queryFn: () => itemService.listar(pacoteId!),
    enabled,
  });

  const resumo = useQuery({
    queryKey: ['pacote', pacoteId, 'resumo-financeiro'],
    queryFn: () => pacoteService.getResumoFinanceiro(pacoteId!),
    enabled,
  });

  return { detalhe, itens, resumo };
}
```

### Buyer portal — refetch on window focus

```typescript
// hooks/portal/useMeusPedidos.ts
export function useMeusPedidos() {
  return useQuery({
    queryKey: ['meus-pedidos'],
    queryFn: portalService.getMeusPedidos,
    staleTime: 1 * 60 * 1000,     // 1 minute
    refetchOnWindowFocus: true,   // always re-check when buyer comes back to tab
  });
}
```

---

## Service Layer Pattern

```typescript
// services/pacoteService.ts
import { apiClient } from '../lib/api';
import type { components } from '../types/api.generated';

type PacoteResumoResponse  = components['schemas']['PacoteResumoResponse'];
type PacoteDetalheResponse = components['schemas']['PacoteDetalheResponse'];
type PacoteRequest         = components['schemas']['PacoteRequest'];
type StatusPacote          = components['schemas']['StatusPacote'];

export const pacoteService = {
  listar: (status?: StatusPacote) =>
    apiClient.get<PacoteResumoResponse[]>('/vendedor/pacotes', { params: { status } })
      .then(r => r.data),

  buscarDetalhe: (id: number) =>
    apiClient.get<PacoteDetalheResponse>(`/vendedor/pacotes/${id}`).then(r => r.data),

  criar: (data: PacoteRequest) =>
    apiClient.post<PacoteResumoResponse>('/vendedor/pacotes', data).then(r => r.data),

  atualizar: (id: number, data: PacoteRequest) =>
    apiClient.put<PacoteResumoResponse>(`/vendedor/pacotes/${id}`, data).then(r => r.data),

  atualizarStatus: (id: number, status: StatusPacote) =>
    apiClient.patch<PacoteResumoResponse>(`/vendedor/pacotes/${id}/status`, { status })
      .then(r => r.data),

  getResumoFinanceiro: (id: number) =>
    apiClient.get(`/vendedor/pacotes/${id}/resumo-financeiro`).then(r => r.data),
};
```

### Portal service — note the correct endpoint path

```typescript
// services/portalService.ts
export const portalService = {
  getMeusPedidos: () =>
    apiClient.get('/portal/meus-pedidos').then(r => r.data),

  // Endpoint is /portal/meus-pedidos/{itemId} — NOT /portal/pedidos/{itemId}
  getDetalhePedido: (itemId: number) =>
    apiClient.get(`/portal/meus-pedidos/${itemId}`).then(r => r.data),
};
```

---

## Forms

Always use React Hook Form + Zod. Never use uncontrolled or plain `useState` forms.

```tsx
const schema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function CompradorForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('nome')} />
      {errors.nome && <p className="text-red-500 text-sm">{errors.nome.message}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar'}
      </Button>
    </form>
  );
}
```

### Password validation rules (apply on all password fields)

```typescript
const passwordSchema = z.string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Deve ter pelo menos uma letra maiúscula')
  .regex(/[0-9]/, 'Deve ter pelo menos um número')
  .regex(/[^A-Za-z0-9]/, 'Deve ter pelo menos um caractere especial');
```

---

## Shared Components Reference

### `StatusChip` — colored badge for package/payment status

```tsx
// Props
interface StatusChipProps {
  status: StatusPacote | StatusPagamento;
  size?: 'sm' | 'md';
}

// Color map (Tailwind classes)
const statusColors: Record<string, string> = {
  RASCUNHO:          'bg-gray-100 text-gray-600',
  AGUARDANDO_ENVIO:  'bg-yellow-100 text-yellow-700',
  EM_VIAGEM:         'bg-blue-100 text-blue-700',
  ALFANDEGA:         'bg-orange-100 text-orange-700',
  TRANSITO:          'bg-purple-100 text-purple-700',
  ENTREGUE:          'bg-green-100 text-green-700',
  FINALIZADO:        'bg-emerald-100 text-emerald-800',
  PENDENTE:          'bg-red-100 text-red-600',
  PAGO:              'bg-green-100 text-green-700',
  PARCIAL:           'bg-yellow-100 text-yellow-700',
};
```

### `MargemBar` — margin progress bar with color thresholds

```tsx
// < 15% → red, 15–25% → yellow, > 25% → green
const color = margin < 15 ? 'bg-red-500' : margin < 25 ? 'bg-yellow-400' : 'bg-green-500';
```

### `AvatarStack` — stacked initials avatars

```tsx
// Shows up to maxVisible (default 3) avatars, then +N
// Extract initials from name: "João Silva" → "JS"
```

### `PasswordStrengthBar` — used on all password fields during sign-up

```tsx
// 4 colored segments that fill as requirements are met
// Checklist below the bar: ✓ 8+ chars, ✓ Maiúscula, ✓ Número, ✓ Especial
// Uses usePasswordStrength(password) hook internally
```

---

## Design System

### Palette and style

- **Primary accent:** `#3b82f6` (Tailwind `blue-500`)
- **Style inspiration:** Notion — clean, minimal, medium density, no heavy gradients
- **Font:** Geist (Google Fonts) with `system-ui` fallback
- **Background:** white / `gray-50` (light mode), `gray-900` (dark mode)
- **Card borders:** `border-gray-200` (light) / `border-gray-700` (dark)
- **Card shadows:** `shadow-sm` — subtle, not dramatic

### Dark mode

- Implemented via `ThemeProvider` context — toggles `dark` class on `<html>`
- All Tailwind dark variants: `dark:bg-gray-900`, `dark:text-gray-100`, etc.
- Theme persists in `localStorage` under key `'ign-theme'`
- Toggle button in topbar (Sun/Moon icons from lucide-react)

### Layout dimensions

- Sidebar expanded: `240px` | Sidebar collapsed: `56px` (icons only + tooltips)
- Sidebar collapse state persists in `localStorage` under `'ign-sidebar-collapsed'`
- Collapse animation: CSS transition `200ms ease`
- Portal layout: `max-w-3xl` centered, no sidebar — mobile-first

### Utility function: `cn()`

Always use `cn()` to merge Tailwind classes:

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Formatting utilities

```typescript
export const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export const formatYuan = (v: number) =>
  `¥ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(v)}`;

export const formatPercent = (v: number) =>
  `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1 }).format(v)}%`;

export const formatDate = (d: string) =>
  new Intl.DateTimeFormat('pt-BR').format(new Date(d));
```

---

## Vendor Layout (VendedorLayout)

### Sidebar navigation items

```
Principal:
  Dashboard     → /vendedor/dashboard  (icon: LayoutGrid)
  Pacotes       → /vendedor/pacotes    (icon: Package)
  Compradores   → /vendedor/compradores (icon: Users)
  Produtos      → /vendedor/produtos   (icon: ShoppingBag)

Ferramentas:
  Simulador     → /vendedor/simulador  (icon: Calculator)
  Tabela Frete  → /vendedor/frete      (icon: Truck)

Footer:
  Avatar + user name + email
  Logout button (icon: LogOut)
```

### Topbar content

- Left: current page title (updates with route)
- Right: theme toggle (Sun/Moon) + "Novo Pacote" primary button

---

## PacoteDetalheModal — Package Detail Modal

This is the most complex component. It opens from the packages list and from the dashboard.

**Structure (Dialog, `max-w-2xl`):**

1. **Header** — `#PKG-{id} · {totalItens} itens · {pesoTotalGramas}g`, package name, status badge, close button
2. **Timeline** — 6 steps: Pedidos → Armazém → Em viagem → Alfândega → Trânsito → Entregue. Connected circles, check marks on completed, pulsing blue on current, gray on future. "Avançar status" button with `AlertDialog` confirmation.
3. **Financial summary grid** — 3 columns: custo total (blue) | receita | lucro (green if positive). Row 2: frete inter. (¥→R$) | taxa alfandeg. | margem %. Show `Skeleton` while `resumo-financeiro` query loads.
4. **Package details grid** — tipo envio | peso total | câmbio | taxa CSSBuy (¥30 fixed) | data criação | data envio
5. **Clients accordion** — one `Accordion` item per `ItensPorCompradorResponse`. Header shows avatar + name + totals. Body shows items table with inline price/payment edit.
6. **"+ Adicionar item" button** at the bottom

### Opening the modal

Use a shared state in a parent context or `useState` in `VendedorLayout`:

```tsx
const [selectedPacoteId, setSelectedPacoteId] = useState<number | null>(null);

// Pass down as prop or via context
// Modal is lazy: queries only fire when selectedPacoteId !== null
```

---

## Cadastro Page — 2-Step Flow

**Step 1 — Select account type:**
Two clickable cards:
- Card 1: Package icon, "Sou Revendedor", "Quero gerenciar minhas importações"
- Card 2: Person icon, "Fui convidado", "Tenho um código de convite de um revendedor"

**Step 2a — Vendor signup:**
- Nome, email, senha (+ PasswordStrengthBar), confirmar senha, checkbox "aceito os termos"
- Button: "Criar conta e iniciar trial de 14 dias"
- On success: call `authStore.setAuth()`, redirect to `/vendedor/dashboard`

**Step 2b — Buyer signup:**
- Nome, email, senha (+ PasswordStrengthBar), código de convite (pre-filled from `?convite=` URL param)
- Button: "Criar minha conta"
- On success: redirect to `/portal/meus-pedidos`

---

## Buyer Portal (PortalLayout)

- **No sidebar** — simple top navbar only
- `max-w-3xl` content area, centered
- **Mobile-first** — designed for 375px screens (iPhone SE)
- **No technical jargon** — never show `RASCUNHO`, `tenant_id`, etc.

### Friendly status labels for buyers

```typescript
const buyerStatusLabels: Record<StatusPacote, string> = {
  RASCUNHO:          'Aguardando confirmação',
  AGUARDANDO_ENVIO:  'Preparando envio',
  EM_VIAGEM:         'A caminho do Brasil 🚢',
  ALFANDEGA:         'Na alfândega 📦',
  TRANSITO:          'Em trânsito para entrega',
  ENTREGUE:          'Entregue ✓',
  FINALIZADO:        'Concluído',
};
```

---

## Admin Area (AdminLayout)

- Sidebar with **slate** palette — no blue accent
- Header badge: "ADMIN PANEL" in red — signals restricted area
- High information density — admin users are technical

### Dashboard KPIs (6 cards)

Total tenants | Pagantes | MRR (R$) highlighted green | Novos cadastros 30d | Total compradores | Total pacotes

### Plan badge colors in tables

```typescript
const planColors: Record<NomePlano, string> = {
  GRATUITO:   'bg-gray-100 text-gray-600',
  BASICO:     'bg-blue-100 text-blue-700',
  PRO:        'bg-green-100 text-green-700',
  ENTERPRISE: 'bg-amber-100 text-amber-700',
};
```

### Tenant status badge colors

```typescript
const tenantStatusColors = {
  TRIAL:     'bg-purple-100 text-purple-700',
  ATIVO:     'bg-green-100 text-green-700',
  SUSPENSO:  'bg-red-100 text-red-600',
  CANCELADO: 'bg-gray-100 text-gray-500',
};
```

---

## SimuladorCusto Page

Two-column layout:
- **Left column:** form (product details, Yuan costs, câmbio, pricing)
- **Right column:** sticky result card (340px)

The calculation runs **locally in real time** using `useWatch` — no API call on every keystroke. Only "Salvar simulação" hits the backend (`POST /vendedor/orcamentos`).

---

## Environment Variables

```bash
# .env.local
VITE_API_URL=http://localhost:8080/api
```

---

## Copilot Behavior Guidelines

### Always
- Use types from `api.generated.ts` — never write duplicate manual interfaces
- Use `cn()` for all conditional class merging
- Use `formatBRL()`, `formatYuan()`, `formatPercent()`, `formatDate()` for display values
- Add loading states (skeleton or spinner) when queries are loading
- Add error states when queries fail
- Use `AlertDialog` (shadcn) for all destructive confirmations (delete, suspend, advance status)
- Use `Dialog` (shadcn) for all create/edit modals
- `invalidateQueries` after every successful mutation

### Never
- Edit files inside `src/components/ui/` — these are shadcn managed
- Create manual fetch with `fetch()` or `XMLHttpRequest` — always use `apiClient`
- Store server data in component `useState` — use TanStack Query
- Write inline style (`style={{...}}`) — use Tailwind classes only
- Use `localStorage` or `sessionStorage` directly — auth state goes through Zustand store
- Add features not in scope: no chat, no export PDF/Excel, no billing UI, no impersonation, no notifications in v1
- Duplicate type definitions that already exist in `api.generated.ts`
- Show raw enum values to buyers (translate to friendly Portuguese text)
- Use `any` type — always type properly or use `unknown`

### Component generation
- New shared components go in `src/components/shared/`
- New page-level components go in the appropriate `src/pages/{area}/` subfolder
- Extract repeated UI patterns into shared components rather than duplicating JSX
- Use `shadcn/ui` primitives (Dialog, Button, Input, Select, Table, Badge, Accordion, Progress, Skeleton, AlertDialog) — do not build custom replacements for these
