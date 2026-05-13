"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { createWorkoutAction } from "./actions";

export default function NewWorkoutPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [workoutName, setWorkoutName] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await createWorkoutAction({ workoutName, startedAt: date });
      router.push("/dashboard");
    });
  }

  return (
    <main className="min-h-screen p-6 md:p-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Workout</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workout Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="workoutName">Workout Name</Label>
              <Input
                id="workoutName"
                placeholder="e.g. Push Day, Leg Day"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Date</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger
                  className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start gap-2 text-left font-normal")}
                >
                  <CalendarIcon className="size-4 shrink-0" />
                  {format(date, "do MMM yyyy")}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      if (d) {
                        setDate(d);
                        setCalendarOpen(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating…" : "Create Workout"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
