import { auth } from '@clerk/nextjs/server';
import { format, parseISO, isValid } from 'date-fns';
import { Dumbbell, Plus } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getWorkoutsForUserOnDate, WorkoutRow } from '@/data/workouts';
import { DatePicker } from './DatePicker';

function parseDate(raw: string | undefined): Date {
  if (raw) {
    const parsed = parseISO(raw);
    if (isValid(parsed)) return parsed;
  }
  return new Date();
}

function groupByWorkout(rows: WorkoutRow[]) {
  const workouts = new Map<number, { workoutName: string | null; exercises: Map<string, WorkoutRow[]> }>();
  for (const row of rows) {
    if (!workouts.has(row.workoutId)) {
      workouts.set(row.workoutId, { workoutName: row.workoutName, exercises: new Map() });
    }
    const workout = workouts.get(row.workoutId)!;
    if (!row.exerciseName) continue;
    if (!workout.exercises.has(row.exerciseName)) workout.exercises.set(row.exerciseName, []);
    workout.exercises.get(row.exerciseName)!.push(row);
  }
  return workouts;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();
  const { date: rawDate } = await searchParams;
  const selectedDate = parseDate(rawDate);

  const rows = userId ? await getWorkoutsForUserOnDate(userId, selectedDate) : [];
  const grouped = groupByWorkout(rows);

  return (
    <main className="min-h-screen p-6 md:p-10 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Excsrcise log</h1>

      <div className="mb-8">
        <DatePicker selected={selectedDate} />
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Workouts for {format(selectedDate, 'do MMM yyyy')}
          </h2>
          <Link href="/dashboard/workout/new" className={cn(buttonVariants(), 'gap-2')}>
            <Plus className="size-4" />
            New Workout
          </Link>
        </div>

        {grouped.size === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <Dumbbell className="size-8" />
            <p className="text-sm">No workouts logged for this date.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {Array.from(grouped.entries()).map(([workoutId, { workoutName, exercises }]) => (
              <li key={workoutId}>
                <Link
                  href={`/dashboard/workout/${workoutId}`}
                  className="block rounded-xl transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Card>
                    <CardHeader className="pb-1 pt-4 px-4">
                      <CardTitle className="text-base">{workoutName ?? 'Unnamed Workout'}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      {exercises.size === 0 ? (
                        <p className="text-sm text-muted-foreground">No exercises added yet.</p>
                      ) : (
                        <ul className="flex flex-col gap-3">
                          {Array.from(exercises.entries()).map(([exerciseName, sets]) => (
                            <li key={exerciseName}>
                              <p className="text-sm font-medium mb-1">{exerciseName}</p>
                              <ul className="flex flex-col gap-1">
                                {sets.map((s) => (
                                  <li key={s.setId} className="text-sm text-muted-foreground">
                                    Set {s.setNumber}: {s.reps ?? '—'} reps
                                    {s.weight ? ` — ${s.weight} kg` : ''}
                                  </li>
                                ))}
                              </ul>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
