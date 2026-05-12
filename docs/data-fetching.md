# Data Fetching

## Rule: Server Components Only

**ALL data fetching MUST be done exclusively via Server Components.**

This is a hard rule with no exceptions:

- **NEVER** fetch data in Client Components (`'use client'`)
- **NEVER** fetch data in Route Handlers (`app/api/*/route.ts`)
- **NEVER** use `useEffect` + `fetch` or SWR/React Query patterns for loading data
- **NEVER** expose database queries directly in page or component files

Fetch data in a Server Component, then pass the result down as props to any Client Components that need it.

## Rule: /data Directory for All Database Queries

Every database query MUST live in a helper function inside the `/data` directory (e.g., `src/data/workouts.ts`).

- Page and layout Server Components call these helpers — they do not query the database directly
- Helper functions MUST use **Drizzle ORM** — never raw SQL strings
- One file per domain area (e.g., `workouts.ts`, `exercises.ts`, `sets.ts`)

### Example structure

```
src/
  data/
    workouts.ts     ← Drizzle-based helpers for workout queries
    exercises.ts    ← Drizzle-based helpers for exercise queries
  app/
    dashboard/
      page.tsx      ← Server Component: calls data helpers, passes results to children
```

### Example helper

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

```ts
// src/app/dashboard/page.tsx  (Server Component — no 'use client')
import { getWorkoutsForUser } from "@/data/workouts";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  const workouts = await getWorkoutsForUser(session.user.id);
  return <WorkoutList workouts={workouts} />;
}
```

## Rule: User Data Isolation — Critical Security Requirement

Every data helper that returns user-owned data **MUST** scope its query to the authenticated user's ID.

- Obtain the user ID from the server-side session (`auth()`) — never from a URL param, query string, or request body that the client controls
- Every query against user-owned tables MUST include a `where(eq(table.userId, userId))` clause (or equivalent join condition)
- A logged-in user must **never** be able to read, modify, or delete another user's data — not even by guessing an ID

### Anti-pattern (never do this)

```ts
// ❌ Fetches by a caller-supplied ID with no ownership check
export async function getWorkout(workoutId: string) {
  return db.select().from(workouts).where(eq(workouts.id, workoutId));
}
```

### Correct pattern

```ts
// ✅ Always scope to the authenticated user
export async function getWorkout(workoutId: string, userId: string) {
  const rows = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
  return rows[0] ?? null;
}
```

The `userId` parameter must always come from the server-side session, never from user-controlled input.
