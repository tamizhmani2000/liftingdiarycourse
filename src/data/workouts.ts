import { db } from '@/db';
import { workouts, workoutExercises, exercises, sets } from '@/db/schema';
import { and, eq, gte, lt } from 'drizzle-orm';

export async function getWorkoutsForUserOnDate(userId: string, date: Date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  return db
    .select({
      workoutId: workouts.id,
      startedAt: workouts.startedAt,
      completedAt: workouts.completedAt,
      exerciseName: exercises.name,
      workoutExerciseId: workoutExercises.id,
      order: workoutExercises.order,
      setId: sets.id,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weight: sets.weight,
    })
    .from(workouts)
    .innerJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .innerJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .innerJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, dayStart),
        lt(workouts.startedAt, dayEnd),
      ),
    )
    .orderBy(workoutExercises.order, sets.setNumber);
}

export type WorkoutRow = Awaited<ReturnType<typeof getWorkoutsForUserOnDate>>[number];
