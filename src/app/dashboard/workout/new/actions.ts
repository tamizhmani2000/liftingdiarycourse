"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createWorkout } from "@/data/workouts";

const CreateWorkoutSchema = z.object({
  workoutName: z.string().min(1).max(100),
  startedAt: z.coerce.date(),
});

type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const parsed = CreateWorkoutSchema.parse(input);

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  return createWorkout(userId, parsed.startedAt, parsed.workoutName);
}
