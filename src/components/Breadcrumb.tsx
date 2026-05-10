import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = Crumb;

/**
 * Site-wide breadcrumb UI (Tailwind). Pair with matching BreadcrumbList JSON-LD on the page.
 */
export function Breadcrumb({
  items,
  className,
  variant = "light",
}: {
  items: BreadcrumbItem[];
  className?: string;
  variant?: "light" | "dark";
}) {
  return (
    <Breadcrumbs
      items={items}
      className={cn(
        "text-sm",
        variant === "dark"
          ? "text-slate-400"
          : "text-muted-foreground",
        className,
      )}
      linkClassName={
        variant === "dark"
          ? "text-amber-400 hover:text-amber-300"
          : "text-primary hover:underline"
      }
      currentClassName={
        variant === "dark" ? "text-slate-200" : "text-foreground font-medium"
      }
      sepClassName={variant === "dark" ? "text-slate-400" : "text-muted-foreground"}
    />
  );
}

export default Breadcrumb;
