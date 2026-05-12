"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-zinc-100">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 max-w-md text-center text-sm text-zinc-400">
          Please try again. If the problem continues, return to the home page.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full bg-brand-500 px-6 py-2 text-sm font-semibold text-zinc-950"
          >
            Try again
          </button>
          <Link href="/" className="rounded-full border border-white/20 px-6 py-2 text-sm font-semibold">
            Home
          </Link>
        </div>
      </body>
    </html>
  );
}
