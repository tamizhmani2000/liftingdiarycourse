'use client';

import { useClerk } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export function AuthButtons() {
  const { openSignIn, openSignUp } = useClerk();

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" onClick={() => openSignIn()}>
        Sign In
      </Button>
      <Button onClick={() => openSignUp()}>
        Sign Up
      </Button>
    </div>
  );
}
