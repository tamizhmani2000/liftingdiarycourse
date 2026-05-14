import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getWorkout } from "@/data/workouts";
import { EditWorkoutForm } from "./EditWorkoutForm";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId: rawId } = await params;
  const workoutId = parseInt(rawId, 10);
  if (isNaN(workoutId)) notFound();

  const { userId } = await auth();
  if (!userId) notFound();

  const workout = await getWorkout(workoutId, userId);
  if (!workout) notFound();

  return <EditWorkoutForm workout={workout} />;
}
