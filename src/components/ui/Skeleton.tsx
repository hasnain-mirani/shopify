import { cn } from "@/lib/utils";

export type SkeletonVariant = "text" | "card" | "circle" | "image";

const VARIANT_STYLES: Record<SkeletonVariant, string> = {
  text: "h-4 w-full rounded",
  card: "h-40 w-full rounded-xl",
  circle: "h-10 w-10 rounded-full",
  image: "aspect-square w-full rounded-xl",
};

/**
 * Shimmering placeholder using a moving gradient.
 * Pair with the `animate-shimmer` keyframes from globals.css so the
 * gradient slides left → right. Background size is 200% so the
 * keyframe's `-200% 0 → 200% 0` shift produces a clean sweep.
 */
const SHIMMER =
  "bg-[length:200%_100%] " +
  "bg-[linear-gradient(110deg,var(--color-brand-100)_8%,var(--color-brand-200)_18%,var(--color-brand-100)_33%)] " +
  "animate-shimmer";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
}

export function Skeleton({
  variant = "text",
  className,
  ...rest
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(VARIANT_STYLES[variant], SHIMMER, className)}
      {...rest}
    />
  );
}

export default Skeleton;
