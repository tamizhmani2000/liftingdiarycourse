import { auth } from '@clerk/nextjs/server';
import { format, parseISO, isValid } from 'date-fns';
import { Dumbbell } from 'lucide-react';
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

function groupByExercise(rows: WorkoutRow[]) {
  const map = new Map<string, { sets: WorkoutRow[] }>();
  for (const row of rows) {
    if (!map.has(row.exerciseName)) map.set(row.exerciseName, { sets: [] });
    map.get(row.exerciseName)!.sets.push(row);
  }
  return map;
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
  const grouped = groupByExercise(rows);

  return (
    <main className="min-h-screen p-6 md:p-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Workout Log</h1>

      <div className="mb-8">
        <DatePicker selected={selectedDate} />
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-4">
          Workouts for {format(selectedDate, 'do MMM yyyy')}
        </h2>

        {grouped.size === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <Dumbbell className="size-8" />
            <p className="text-sm">No workouts logged for this date.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {Array.from(grouped.entries()).map(([exerciseName, { sets }]) => (
              <li key={exerciseName}>
                <Card>
                  <CardHeader className="pb-1 pt-4 px-4">
                    <CardTitle className="text-base">{exerciseName}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <ul className="flex flex-col gap-1">
                      {sets.map((s) => (
                        <li key={s.setId} className="text-sm text-muted-foreground">
                          Set {s.setNumber}: {s.reps ?? '—'} reps
                          {s.weight ? ` — ${s.weight} kg` : ''}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
