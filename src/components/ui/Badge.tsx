import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "sale" | "new" | "soldOut" | "featured";

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  default: "bg-brand-100 text-brand-800",
  sale: "bg-red-600 text-white",
  new: "bg-accent text-brand-900",
  soldOut: "bg-brand-300 text-brand-700",
  featured:
    "bg-gradient-to-r from-accent-dark via-accent to-accent-light text-brand-900",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** For `sale` variant — show "-N% off" instead of a static label. */
  percentOff?: number;
  /** For `soldOut` variant — wrap children in <s> for strikethrough. */
  strikethrough?: boolean;
}

const BASE =
  "inline-flex items-center justify-center gap-1 rounded-full uppercase " +
  "tracking-wider text-[10px] font-semibold px-2.5 py-1 leading-none whitespace-nowrap";

function defaultLabel(
  variant: BadgeVariant,
  percentOff?: number,
): string | null {
  switch (variant) {
    case "sale":
      return percentOff && percentOff > 0 ? `-${Math.round(percentOff)}% off` : "Sale";
    case "new":
      return "New";
    case "soldOut":
      return "Sold out";
    case "featured":
      return "Featured";
    default:
      return null;
  }
}

export function Badge({
  variant = "default",
  percentOff,
  strikethrough = false,
  className,
  children,
  ...rest
}: BadgeProps) {
  const label = children ?? defaultLabel(variant, percentOff);

  return (
    <span
      className={cn(BASE, VARIANT_STYLES[variant], className)}
      {...rest}
    >
      {strikethrough && variant === "soldOut" ? <s>{label}</s> : label}
    </span>
  );
}

export default Badge;
