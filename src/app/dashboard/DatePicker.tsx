'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export function DatePicker({ selected }: { selected: Date }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    setOpen(false);
    router.push(`/dashboard?date=${format(date, 'yyyy-MM-dd')}`);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(buttonVariants({ variant: 'outline' }), 'w-[220px] justify-start gap-2')}
      >
        <CalendarIcon className="size-4 shrink-0" />
        {format(selected, 'do MMM yyyy')}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={selected} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  );
}
