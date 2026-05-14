# Server Components

## Rule: Async Params and SearchParams Must Be Awaited

**This app runs on Next.js 15. `params` and `searchParams` are Promises — they MUST be awaited before use.**

Next.js 15 made `params` and `searchParams` asynchronous. Accessing them without `await` returns a Promise object, not the expected values.

### Anti-pattern (never do this)

```tsx
// ❌ params is a Promise — destructuring directly gives undefined values
export default async function EditWorkoutPage({
  params,
}: {
  params: { workoutId: string };
}) {
  const { workoutId } = params; // undefined at runtime
}
```

```tsx
// ❌ searchParams is a Promise — same problem
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const { date } = searchParams; // undefined at runtime
}
```

### Correct pattern

```tsx
// ✅ Await params before destructuring
export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
}
```

```tsx
// ✅ Await searchParams before destructuring
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
}
```

### Type signatures

Always type `params` and `searchParams` as `Promise<...>` in the function signature — this matches the actual Next.js 15 runtime type and prevents accidentally using them without `await`.

| Prop | Type |
|------|------|
| `params` | `Promise<{ [key: string]: string }>` |
| `searchParams` | `Promise<{ [key: string]: string \| string[] \| undefined }>` |

## Rule: Page Components Must Be Async

Page and layout Server Components that access `params`, `searchParams`, or any database/auth call must be declared `async`.

```tsx
// ✅ async so params and data helpers can be awaited
export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  const { userId } = await auth();
  const workout = await getWorkout(Number(workoutId), userId!);
  // ...
}
```

## Rule: Never Access params in Client Components

`params` and `searchParams` from the file-system router are only available in Server Components (page and layout files). Do not attempt to access them in Client Components.

- Pass any values derived from `params` down as props to Client Components
- Client Components that need the current URL path can use `useParams()` or `useSearchParams()` hooks from `next/navigation` — but only for UI concerns, never for data fetching
