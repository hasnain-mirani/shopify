import Link from "next/link";
import { cn } from "@/lib/utils";

export interface Crumb {
  name: string;
  href?: string;
}

export function Breadcrumbs({
  items,
  className,
  linkClassName,
  currentClassName,
  sepClassName,
}: {
  items: Crumb[];
  className?: string;
  linkClassName?: string;
  currentClassName?: string;
  sepClassName?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((c, i) => (
          <li key={`${c.name}-${i}`} className="flex items-center gap-1.5">
            {i > 0 ? (
              <span
                className={cn("text-brand-400", sepClassName)}
                aria-hidden
              >
                /
              </span>
            ) : null}
            {c.href ? (
              <Link
                href={c.href}
                className={cn(
                  "text-accent hover:underline font-medium",
                  linkClassName,
                )}
              >
                {c.name}
              </Link>
            ) : (
              <span
                className={cn("text-brand-900 font-medium", currentClassName)}
              >
                {c.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
