"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[search]", error);
  }, [error]);

  return (
    <div className="container-shop py-24 text-center">
      <h1 className="heading-display text-3xl text-brand-900">
        Search is unavailable
      </h1>
      <p className="mt-3 text-sm text-brand-600">
        Something went wrong. Please try again.
      </p>
      <div className="mt-8">
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
