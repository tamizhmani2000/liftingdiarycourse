"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { updateWorkout } from "@/data/workouts";

const UpdateWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  workoutName: z.string().min(1).max(100),
  startedAt: z.coerce.date(),
});

type UpdateWorkoutInput = z.infer<typeof UpdateWorkoutSchema>;

export async function updateWorkoutAction(input: UpdateWorkoutInput) {
  const parsed = UpdateWorkoutSchema.parse(input);

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await updateWorkout(parsed.workoutId, userId, {
    workoutName: parsed.workoutName,
    startedAt: parsed.startedAt,
  });
}
