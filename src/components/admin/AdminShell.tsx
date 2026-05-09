import { cn } from "@/lib/utils";

/** Page wrapper: consistent padding and max width for admin pages. */
export function AdminPage({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-[1400px] mx-auto w-full">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>
      {children}
    </div>
  );
}

/** Rounded card block. Optional `title` / `description` render a real header (not the HTML `title` tooltip). */
export function AdminCard({
  className,
  title,
  description,
  contentClassName,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
  /** Padding/flush layout for the body under the header (default: p-5 md:p-6). */
  contentClassName?: string;
}) {
  const hasHeader = Boolean(title?.trim() || description?.trim());
  if (!hasHeader) {
    return (
      <div
        {...rest}
        className={cn(
          "rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900",
          className,
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      {...rest}
      className={cn(
        "rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden",
        className,
      )}
    >
      <div className="border-b border-zinc-200 bg-zinc-50/90 px-5 py-3.5 dark:border-zinc-800 dark:bg-zinc-900/60">
        {title?.trim() ? (
          <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
        ) : null}
        {description?.trim() ? (
          <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        ) : null}
      </div>
      <div className={cn(contentClassName ?? "p-5 md:p-6")}>{children}</div>
    </div>
  );
}

/** KPI stat card — large number + label. */
export function AdminStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <AdminCard className="p-5">
      <p className="text-xs uppercase tracking-wider text-zinc-500 font-medium">
        {label}
      </p>
      <p className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
        {value}
      </p>
      {sub && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{sub}</p>
      )}
    </AdminCard>
  );
}

/** Empty-state block shown when a table/list has no data. */
export function AdminEmpty({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-white/50 p-10 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
      <p className="text-lg font-medium">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
