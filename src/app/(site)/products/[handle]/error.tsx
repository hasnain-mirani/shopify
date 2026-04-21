"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[products/[handle]]", error);
  }, [error]);

  return (
    <div className="container-shop py-24 text-center">
      <h1 className="heading-display text-3xl md:text-4xl text-brand-900">
        Something went wrong
      </h1>
      <p className="mt-3 text-sm text-brand-600">
        We couldn&apos;t load this product. Please try again in a moment.
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/shop")}>
          Back to shop
        </Button>
      </div>
    </div>
  );
}
