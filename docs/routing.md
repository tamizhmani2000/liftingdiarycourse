# Routing

## Route Structure

All application pages live under `/dashboard`. The root `/` page is a public landing page only — it must not render authenticated app content.

```
/                          → public landing page (sign in / sign up CTAs)
/dashboard                 → protected: main dashboard
/dashboard/workout/new     → protected: create workout
/dashboard/workout/[id]    → protected: view / edit workout
```

Do not create top-level routes for app features. All new pages must be nested under `/dashboard`.

## Route Protection via Middleware

The `/dashboard` subtree is protected exclusively in `src/middleware.ts` using Clerk's `clerkMiddleware`. Do not add auth redirect logic inside page components or layouts.

```ts
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
```

When adding a new protected section, add its prefix to `createRouteMatcher` — never use `req.url` checks inside a page.

See `docs/auth.md` for full Clerk setup details.

## File Conventions

Follow Next.js App Router conventions inside `src/app/`:

| File | Purpose |
|---|---|
| `page.tsx` | Route segment UI (server component by default) |
| `layout.tsx` | Shared layout wrapping child segments |
| `loading.tsx` | Suspense fallback for the segment |
| `error.tsx` | Error boundary for the segment (`'use client'`) |
| `actions.ts` | Server Actions scoped to the route segment |

Co-locate route-specific components and actions with their segment. Shared components go in `src/components/`.

## Dynamic Segments

Use `[param]` folders for dynamic routes (e.g., `workout/[workoutId]`). Access params in server components via the `params` prop:

```tsx
// src/app/dashboard/workout/[workoutId]/page.tsx
export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  // ...
}
```

Never read dynamic segment values from query strings or request bodies for resource identification.

## Navigation

Use Next.js `<Link>` for all internal navigation. Never use `<a href>` for in-app links.

```tsx
import Link from "next/link";

<Link href="/dashboard">Dashboard</Link>
<Link href={`/dashboard/workout/${id}`}>View Workout</Link>
```

For programmatic navigation inside Client Components, use the `useRouter` hook from `next/navigation`.

## What Not to Do

- Do not create app pages outside of `/dashboard` (except the root landing page).
- Do not guard routes inside `page.tsx` or `layout.tsx` — use middleware only.
- Do not use `<a>` tags for internal links.
- Do not access `params` synchronously — always `await params` in async server components.
