# BLOOM

Plateforme digitale permettant aux créateurs francophones de vendre leurs produits numériques simplement et efficacement.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/bloom run dev` — run the frontend (port 5173)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- Frontend: React 19, TypeScript 5.9, Vite, Tailwind CSS, Wouter, Lucide React
- Backend: Express 5, Node.js 24, TypeScript 5.9
- Database: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: Vite (frontend), esbuild (backend CJS bundle)

## Architecture

### Database

- **users**: Core user table with email, password hash, display name
- **creator_profiles**: Extended profile with username, bio, domain, objective
- **onboarding**: Track onboarding progress (welcome → profile → objective → done)
- **products**: Creator products (ebook, formation, pack, template, guide, autre)
- **activities**: User activity log (creation, learning, action)

### API Structure

- `/api/healthz` — Health check
- `/api/auth/register` — User registration
- `/api/auth/login` — User login
- `/api/auth/me` — Get current user

### Frontend Routes

- `/` — Home
- `/discover` — Product discovery
- `/create` — Create new product
- `/academy` — Learning resources
- `/coach` — Bloom Coach (AI assistant)
- `/activity` — User activity
- `/profile` — User profile

## Design System

**Palette**:
- Background: #f4f0e8 (ivoire)
- Foreground: #0d0d0d (noir profond)
- Primary: #a89860 (or chaud)
- Secondary: #351621 (burgundy)
- Accent: #285c68 (teal)

**Typography**:
- Display: Bricolage Grotesque (headers)
- Body: DM Sans (content)

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (required for backend)
- `PORT` — Server port (frontend Vite server)
- `BASE_PATH` — Base URL for frontend (Replit URL)
- `NODE_ENV` — Environment (development/production)
- `LOG_LEVEL` — Logging level (info/debug/warn/error)

## Getting Started

1. Install dependencies: `pnpm install`
2. Set up database: `pnpm --filter @workspace/db run push`
3. Run API server: `pnpm --filter @workspace/api-server run dev`
4. Run frontend: `pnpm --filter @workspace/bloom run dev`
5. Open http://localhost:5173

## User Preferences

- All French UI text (UX is in French)
- Premium, modern, human aesthetic
- Simple, no unnecessary complexity
- Warm, encouraging tone

## Gotchas

- DATABASE_URL required to start API server
- Frontend needs valid PORT and BASE_PATH from Replit environment
- Auth is demo-only until JWT implementation
- API codegen: Run `pnpm --filter @workspace/api-spec run codegen` after updating OpenAPI spec

## Next Steps

1. **Auth**: Implement JWT tokens and proper password hashing
2. **Database**: Connect to actual Supabase/PostgreSQL
3. **Onboarding**: Full onboarding flow with profile setup
4. **Products**: CRUD operations for creator products
5. **Coach**: AI integration for Bloom Coach
