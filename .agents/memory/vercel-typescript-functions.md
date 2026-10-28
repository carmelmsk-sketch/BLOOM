---
name: Vercel TypeScript functions
description: Vercel's TypeScript function emission, module format, and SPA rewrite behavior in this monorepo.
---

For Vercel Node functions in this TypeScript monorepo:

- Keep the API function's nearest package scope ESM when it statically imports ESM application modules; otherwise Vercel can compile the entrypoint as CommonJS and fail with `ERR_REQUIRE_ESM`.
- When using explicit relative `.ts` imports, pair `allowImportingTsExtensions` with `rewriteRelativeImportExtensions` so TypeScript can emit the function and rewrite those specifiers to `.js`. A no-emit typecheck alone does not validate function emission.
- Exclude `/api/` from a Vite SPA catch-all rewrite, or API requests can be served `index.html` instead of reaching functions.

**Why:** Vercel's production builder exposed three separate behaviors that local no-emit checks and direct Node imports did not: TypeScript emit configuration, CommonJS-to-ESM loading, and SPA rewrite routing.

**How to apply:** When debugging Vercel API functions, inspect build logs, runtime logs, and the public route response separately; validate emitted code and verify a deployed `/api/healthz` returns JSON.
