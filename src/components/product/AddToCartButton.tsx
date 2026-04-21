"use client";

import { useEffect, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";

export interface AddToCartButtonProps
  extends Omit<ButtonProps, "onClick" | "isLoading" | "children"> {
  /** Variant id to add. When `null`, button renders disabled. */
  variantId: string | null;
  availableForSale: boolean;
  quantity?: number;
  label?: string;
  /** Called after a successful add — handy for closing a dialog, etc. */
  onAdded?: () => void;
}

/**
 * Primary PDP "Add to bag" button. Shows three states:
 *   1. idle — shopping-bag icon + label
 *   2. adding — spinner (via Button's isLoading)
 *   3. added — green check flash for ~1.2s before reverting
 *
 * Disabled automatically when unavailable / no variant resolved.
 */
export function AddToCartButton({
  variantId,
  availableForSale,
  quantity = 1,
  label,
  onAdded,
  className,
  disabled,
  size = "lg",
  variant = "primary",
  ...rest
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [state, setState] = useState<"idle" | "adding" | "added">("idle");

  // Reset the flash after 1.2s.
  useEffect(() => {
    if (state !== "added") return;
    const t = setTimeout(() => setState("idle"), 1200);
    return () => clearTimeout(t);
  }, [state]);

  const resolvedLabel = (() => {
    if (!availableForSale) return "Sold out";
    if (!variantId) return "Select options";
    if (state === "added") return "Added";
    return label ?? "Add to bag";
  })();

  const isDisabled = disabled || !variantId || !availableForSale;

  const onClick = async () => {
    if (!variantId || !availableForSale) return;
    setState("adding");
    try {
      await addItem(variantId, quantity);
      setState("added");
      onAdded?.();
    } catch {
      setState("idle");
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onClick}
      isLoading={state === "adding"}
      disabled={isDisabled}
      leftIcon={
        state === "added" ? (
          <Check className="h-4 w-4" />
        ) : (
          <ShoppingBag className="h-4 w-4" />
        )
      }
      className={cn(
        "w-full transition-colors",
        state === "added" && "!bg-green-700 hover:!bg-green-700",
        className,
      )}
      {...rest}
    >
      {resolvedLabel}
    </Button>
  );
}

export default AddToCartButton;
