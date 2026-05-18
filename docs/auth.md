# Authentication

## Provider: Clerk

**This app uses [Clerk](https://clerk.com) exclusively for authentication.** Do not introduce any other auth library (NextAuth, Auth.js, custom JWT, etc.).

The Clerk package is `@clerk/nextjs`. All imports must come from this package.

## Setup

`<ClerkProvider>` must wrap the entire application. It lives in `src/app/layout.tsx` around all children — do not move it or add a second provider.

```tsx
// src/app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
```

## Route Protection via Middleware

All protected routes must be guarded with Clerk's `clerkMiddleware` in `src/middleware.ts`. This is the canonical place for route-level auth enforcement — do not add redirect logic inside page components.

```ts
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/workout(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
```

Add new protected route prefixes to `createRouteMatcher` — never check `req.url` manually inside a page.

## Getting the Current User

### Server Components and data helpers

Use `auth()` from `@clerk/nextjs/server` to obtain the `userId`. This is the only approved way to get the authenticated user's ID on the server.

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
```

Pass `userId` into data helpers — never read it from URL params or request bodies (see `data-fetching.md` for the user-data isolation rule).

### Client Components

Use the `useClerk` or `useUser` hooks from `@clerk/nextjs`. Only use these for UI state (show/hide elements, display name, avatar). Never fetch data inside Client Components.

```tsx
'use client';
import { useUser } from "@clerk/nextjs";

const { user } = useUser();
```

## Conditional UI Rendering

Use Clerk's `<Show>` component (from `@clerk/nextjs`) to conditionally render auth-related UI. Do not implement manual `isSignedIn` boolean checks in JSX.

```tsx
import { Show } from "@clerk/nextjs";

<Show when="signed-out">
  <AuthButtons />
</Show>
<Show when="signed-in">
  <UserButton />
</Show>
```

## Auth UI Components

- **Sign in / Sign up**: trigger Clerk's hosted modals via `useClerk().openSignIn()` and `useClerk().openSignUp()`. Do not build custom sign-in forms.
- **User menu / avatar**: use Clerk's `<UserButton />` component. Do not build a custom user menu.
- Both components are Client Components and must have `'use client'` at the top of their file.

```tsx
// src/components/AuthButtons.tsx
'use client';
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function AuthButtons() {
  const { openSignIn, openSignUp } = useClerk();
  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" onClick={() => openSignIn()}>Sign In</Button>
      <Button onClick={() => openSignUp()}>Sign Up</Button>
    </div>
  );
}
```

## Environment Variables

Clerk requires two environment variables. Store them in `.env.local` (never commit this file).

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is safe to expose to the browser. `CLERK_SECRET_KEY` must remain server-side only — never import it in a Client Component or expose it in any client bundle.

## What Not to Do

- Do not use `getServerSession`, `useSession`, or any NextAuth/Auth.js API.
- Do not store auth state in React context or Zustand — Clerk manages this.
- Do not read `userId` from the URL or request body to scope database queries.
- Do not add redirect logic for unauthenticated users inside page components — handle it in middleware.
- Do not call `auth()` inside Client Components — it only works on the server.
