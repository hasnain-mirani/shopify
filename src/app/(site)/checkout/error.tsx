"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function CheckoutError({
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
    <div className="flex min-h-[50vh] flex-col items-center justify-center bg-zinc-950 px-6 py-16 text-center text-zinc-100">
      <h1 className="text-2xl font-semibold tracking-tight">Checkout unavailable</h1>
      <p className="mt-3 max-w-md text-sm text-zinc-400">
        Something went wrong while loading checkout. Your bag is still saved — try again or return to
        the cart.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-zinc-950 transition hover:brightness-110"
        >
          Try again
        </button>
        <Link
          href="/cart"
          className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-zinc-100 hover:bg-white/5"
        >
          View cart
        </Link>
      </div>
    </div>
  );
}
