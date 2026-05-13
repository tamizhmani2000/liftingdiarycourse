# Data Mutations

## Rule: /data Directory for All Database Writes

Every database mutation MUST live in a helper function inside the `/data` directory (e.g., `src/data/workouts.ts`).

- Server actions call these helpers — they do not call the database directly
- Helper functions MUST use **Drizzle ORM** — never raw SQL strings
- Mutation helpers live in the same domain file as their corresponding query helpers (e.g., `workouts.ts` holds both reads and writes for workouts)

### Example structure

```
src/
  data/
    workouts.ts          ← Drizzle-based helpers for workout queries AND mutations
    exercises.ts         ← Drizzle-based helpers for exercise queries AND mutations
  app/
    workouts/
      new/
        page.tsx         ← Server Component or Client Component
        actions.ts       ← Server actions for this route
```

### Example mutation helper

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";

export async function createWorkout(userId: string, name: string, date: Date) {
  const [row] = await db
    .insert(workouts)
    .values({ userId, name, date })
    .returning();
  return row;
}

export async function deleteWorkout(workoutId: string, userId: string) {
  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

## Rule: Server Actions in Colocated actions.ts Files

All server actions MUST be defined in a file named `actions.ts` colocated with the route or feature that uses them.

- **NEVER** define server actions directly inside page or component files
- **NEVER** define server actions in a single global `actions.ts` — keep them colocated with their feature
- Every `actions.ts` file MUST have `"use server"` at the top

### Example structure

```
src/app/workouts/new/
  page.tsx       ← imports the action from ./actions
  actions.ts     ← "use server" — defines createWorkoutAction
```

## Rule: Typed Parameters — No FormData

All server action parameters MUST be explicitly typed. `FormData` is **never** an acceptable parameter type.

- Define a dedicated TypeScript type or interface for each action's input
- Pass structured data from the client, not raw form payloads

### Anti-pattern (never do this)

```ts
// ❌ FormData parameter — not allowed
export async function createWorkoutAction(data: FormData) { ... }
```

### Correct pattern

```ts
// ✅ Explicit typed parameter
export async function createWorkoutAction(input: CreateWorkoutInput) { ... }
```

## Rule: Zod Validation in Every Server Action

Every server action MUST validate its arguments with Zod before doing anything else.

- Define the Zod schema in the same `actions.ts` file, above the action function
- Call `schema.parse(input)` (throws on invalid input) or `schema.safeParse(input)` and return an error result — never skip validation
- Validation runs before any auth check or database call

### Example actions.ts

```ts
// src/app/workouts/new/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { createWorkout } from "@/data/workouts";

const CreateWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.coerce.date(),
});

type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const parsed = CreateWorkoutSchema.parse(input);

  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthenticated");

  return createWorkout(session.user.id, parsed.name, parsed.date);
}
```

## Rule: User Data Isolation in Mutations

The same ownership rule that applies to queries applies to every mutation.

- Obtain the user ID from the server-side session (`auth()`) — never from the action's input parameters
- Every mutation helper that touches user-owned rows MUST include a `where` clause scoped to `userId` so one user cannot modify another user's data

### Anti-pattern (never do this)

```ts
// ❌ userId comes from the caller — can be spoofed
export async function deleteWorkoutAction(input: { workoutId: string; userId: string }) {
  const parsed = DeleteWorkoutSchema.parse(input);
  await deleteWorkout(parsed.workoutId, parsed.userId);
}
```

### Correct pattern

```ts
// ✅ userId always comes from the server-side session
export async function deleteWorkoutAction(input: { workoutId: string }) {
  const parsed = DeleteWorkoutSchema.parse(input);

  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthenticated");

  await deleteWorkout(parsed.workoutId, session.user.id);
}
```
