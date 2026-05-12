"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function CartError({
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
    <div className="flex min-h-[50vh] flex-col items-center justify-center bg-background px-6 py-16 text-center">
      <h1 className="font-display text-2xl font-semibold text-foreground">We couldn&apos;t load your cart</h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Something went wrong. Please try again, or continue shopping — your bag may still sync from this
        device.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => reset()} className="btn-primary min-h-11 px-6">
          Try again
        </button>
        <Link href="/shop" className="btn-outline min-h-11 inline-flex items-center px-6">
          Browse shop
        </Link>
      </div>
    </div>
  );
}
