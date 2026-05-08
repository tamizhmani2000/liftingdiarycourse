"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Dumbbell } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Workout = {
  id: number;
  name: string;
  sets: number;
  reps: number;
  weightKg: number;
};

const STUB_WORKOUTS: Workout[] = [
  { id: 1, name: "Back Squat", sets: 4, reps: 5, weightKg: 100 },
  { id: 2, name: "Romanian Deadlift", sets: 3, reps: 8, weightKg: 80 },
  { id: 3, name: "Leg Press", sets: 3, reps: 12, weightKg: 120 },
];

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  return (
    <main className="min-h-screen p-6 md:p-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Workout Log</h1>

      <div className="mb-8">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-[220px] justify-start gap-2"
            )}
          >
            <CalendarIcon className="size-4 shrink-0" />
            {format(selectedDate, "do MMM yyyy")}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  setOpen(false);
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-4">
          Workouts for {format(selectedDate, "do MMM yyyy")}
        </h2>

        {STUB_WORKOUTS.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <Dumbbell className="size-8" />
            <p className="text-sm">No workouts logged for this date.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {STUB_WORKOUTS.map((workout) => (
              <li key={workout.id}>
                <Card>
                  <CardHeader className="pb-1 pt-4 px-4">
                    <CardTitle className="text-base">{workout.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground">
                      {workout.sets} sets &times; {workout.reps} reps &mdash;{" "}
                      {workout.weightKg} kg
                    </p>
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
