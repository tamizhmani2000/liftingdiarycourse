'use client';

import { useClerk } from '@clerk/nextjs';

export function AuthButtons() {
  const { openSignIn, openSignUp } = useClerk();

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => openSignIn()}
        className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
      >
        Sign In
      </button>
      <button
        onClick={() => openSignUp()}
        className="px-4 py-2 text-sm font-medium rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors cursor-pointer"
      >
        Sign Up
      </button>
    </div>
  );
}
