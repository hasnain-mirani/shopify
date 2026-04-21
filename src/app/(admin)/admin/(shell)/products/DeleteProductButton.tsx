"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Trash2, Loader2 } from "lucide-react";
import { deleteProductAction } from "./actions";
import { cn } from "@/lib/utils";

interface Props {
  productId: string;
  productTitle: string;
  productHandle?: string;
}

/**
 * Icon-button that deletes a product after a confirmation step.
 *
 * First click arms the button (shows a red "Confirm" state). A second click
 * within the 5-second window runs the server action; anywhere else resets.
 * This avoids a full modal while still preventing a single-click disaster.
 */
export function DeleteProductButton({
  productId,
  productTitle,
  productHandle,
}: Props) {
  const [armed, setArmed] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (!armed) {
      setArmed(true);
      window.setTimeout(() => setArmed(false), 5_000);
      return;
    }

    startTransition(async () => {
      const result = await deleteProductAction(productId, productHandle);
      if (result.ok) {
        toast.success(`Deleted "${productTitle}".`);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to delete product.");
        setArmed(false);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={
        armed ? `Click again to confirm deleting ${productTitle}` : `Delete ${productTitle}`
      }
      title={armed ? "Click again to confirm" : "Delete product"}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60",
        armed
          ? "bg-red-600 text-white hover:bg-red-500"
          : "text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30",
      )}
    >
      {pending ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Trash2 size={14} />
      )}
      <span className="sr-only">
        {pending
          ? "Deleting"
          : armed
            ? "Confirm delete"
            : `Delete ${productTitle}`}
      </span>
    </button>
  );
}
