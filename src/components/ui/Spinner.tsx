import { cn } from "@/lib/utils";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
  label?: string;
}

const SIZE_MAP: Record<SpinnerSize, string> = {
  sm: "h-3.5 w-3.5 border-[1.5px]",
  md: "h-5 w-5 border-2",
  lg: "h-8 w-8 border-[2.5px]",
};

/**
 * Minimal spinning ring. Uses a border-based spinner (no extra DOM) so it
 * can be dropped inline alongside text without layout shift.
 */
export function Spinner({
  size = "md",
  label = "Loading",
  className,
  ...rest
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block rounded-full border-current border-t-transparent animate-spin align-[-0.125em]",
        SIZE_MAP[size],
        className,
      )}
      {...rest}
    >
      <span className="sr-only">{label}</span>
    </span>
  );
}

export default Spinner;
