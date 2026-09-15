<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Project: roldancommerce

E-commerce for **Roldan Marcenaria** (Sao Carlos/SP, Brazil) — MDF furniture and decor.

## Tech Stack

| Layer      | Tech                                                |
| ---------- | --------------------------------------------------- |
| Framework  | Next.js 16 (App Router) + React 19 + React Compiler |
| Language   | TypeScript (strict)                                 |
| Database   | Supabase (PostgreSQL) — no Prisma                   |
| Auth       | Supabase Auth (email/password + Google OAuth)       |
| Storage    | Supabase Storage (bucket: `product-images`)         |
| Styling    | Tailwind CSS v4 + shadcn/ui (base-nova)             |
| Theming    | next-themes (light/dark/system)                     |
| Animations | Framer Motion                                       |
| Forms      | React Hook Form + Zod                               |
| PDF        | jsPDF + jspdf-autotable                             |
| Testing    | Playwright                                          |
| Hooks      | Husky + lint-staged (Prettier)                      |

## Architecture

### File Structure Convention

```
src/app/
  [route]/
    page.tsx              # Server Component (entry point)
    layout.tsx            # Layout (if shared)
    _components/          # Client Components (route-scoped, underscore prefix)
    _actions/             # Server Actions (shared across routes)
    _data-access/         # Data Access Layer (server-only queries)
```

- `_components/`, `_actions/`, `_data-access/` use underscore prefix to avoid route generation
- Server Components by default; Client Components only when needed (state, effects, events)
- Forms always use shadcn/ui + React Hook Form + Zod validation

### Supabase Clients

| Client                | File                         | Purpose                                 |
| --------------------- | ---------------------------- | --------------------------------------- |
| `createClient()`      | `lib/supabase/server.ts`     | Server Components/Actions (cookie-auth) |
| `createBuildClient()` | `lib/supabase/build.ts`      | Read-only queries (no auth context)     |
| `createClient()`      | `lib/supabase/client.ts`     | Browser Client Components (singleton)   |
| `updateSession()`     | `lib/supabase/middleware.ts` | Middleware (session refresh)            |

### Admin Security Pattern

All admin mutation server actions use `requireAdmin()` from `lib/auth/admin.ts`:

```typescript
let supabase;
try {
  supabase = await requireAdmin();
} catch (e) {
  return { error: (e as Error).message };
}
```

The helper verifies `app_metadata.role === "admin"` or `user_metadata.role === "admin"` and returns an authenticated Supabase client. Non-admin calls return `{ error: "Acesso nao autorizado" }`.

Read-only admin actions use `createBuildClient()` (anonymous, no auth needed for public data).

### Dark Mode Pattern

Theme switching uses `next-themes` with class-based toggle:

```tsx
// Layout wraps with ThemeProvider
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
```

Components use semantic CSS tokens (`bg-background`, `text-foreground`, `bg-card`, etc.) defined in `globals.css`. Toggle component at `src/components/theme-toggle.tsx` cycles through light/dark/system.

### Money Convention

All monetary values are stored in **centavos** (integer). Divide by 100 for display:

```typescript
formatPrice(order.total / 100); // R$ 59,90
```

### Product ID Convention

Products use **slug as ID** (`products.id = slug`). Slugs are auto-generated from name:

```typescript
const slug = name
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");
```

## Database Tables

| Table               | Purpose                                         |
| ------------------- | ----------------------------------------------- |
| `products`          | Product catalog (id=slug, price in centavos)    |
| `categories`        | Product categories with sort order              |
| `orders`            | Customer orders with payment/shipping status    |
| `order_items`       | Line items per order                            |
| `profiles`          | User profiles (CPF, address)                    |
| `product_relations` | Bidirectional cross-sell links                  |
| `product_images`    | Multiple images per product (order, is_primary) |

### Key Enums

- **Availability**: `pronta-entrega` | `fabricacao` | `sob-medida`
- **Order status**: `pendente` | `confirmed` | `shipped` | `delivered` | `cancelled` | `a-receber`
- **Shipping status**: `pendente` | `enviado` | `entregue`
- **Payment method**: `pix` | `card` | `entrega`

## PRDs

| File                               | Status                               |
| ---------------------------------- | ------------------------------------ |
| `docs/prd/roldancommerce.md`       | Implementada                         |
| `docs/prd/feature-painel-admin.md` | Implementada (all 11 specs complete) |

## Coding Rules

See `.opencode/rules/rules.mdc` and `.opencode/rules/page-rules.mdc` for full rules. Key points:

- TypeScript first, strict types
- Server Components by default
- Forms: shadcn/ui + React Hook Form + Zod
- No inline styles — use Tailwind
- No barrel file imports
- Prefix event handlers: `handle*`
- Prefix booleans: `is*`, `has*`, `can*`
- Prefix hooks: `use*`
- Use semantic color tokens (`bg-background`, `text-foreground`) — no hardcoded colors

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run typecheck    # tsc --noEmit
npm run test         # Playwright tests
npm run prepare      # Setup Husky hooks
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Important Notes

- No Prisma in this project — all DB access is via Supabase JS client directly
- The hardcoded `PRODUCTS` array in `src/data/products.ts` is legacy — live data comes from Supabase
- `formatPrice()` and `calcFrete()` in `src/data/products.ts` are shared utilities (not product data)
- Admin panel is fully implemented: Dashboard, Products CRUD, Categories CRUD, Orders, Financial, Stats, Shipping
- All 13 admin mutation actions are protected by `requireAdmin()` check
- Dark mode supported via `next-themes` — all components use semantic CSS tokens
- Product images uploaded via Supabase Storage (bucket: `product-images`)
- Admin product creation uses file upload (not URL input)
