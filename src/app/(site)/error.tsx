"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function SiteError({
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
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="font-display text-2xl font-semibold text-foreground md:text-3xl">Something went wrong</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        This page hit an unexpected error. You can retry or head back to the shop — your cart and account
        are unchanged.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => reset()} className="btn-primary min-h-11 px-6">
          Try again
        </button>
        <Link href="/" className="btn-outline min-h-11 inline-flex items-center px-6">
          Home
        </Link>
        <Link href="/shop" className="btn-outline min-h-11 inline-flex items-center px-6">
          Shop
        </Link>
      </div>
    </div>
  );
}
