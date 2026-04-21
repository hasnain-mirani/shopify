import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "neutral" | "info";

const TONE_STYLES: Record<Tone, string> = {
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  danger: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  neutral: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  info: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
};

const FINANCIAL_TONES: Record<string, Tone> = {
  PAID: "success",
  PARTIALLY_PAID: "warning",
  PENDING: "warning",
  AUTHORIZED: "info",
  PARTIALLY_REFUNDED: "warning",
  REFUNDED: "neutral",
  VOIDED: "neutral",
  EXPIRED: "neutral",
};

const FULFILLMENT_TONES: Record<string, Tone> = {
  FULFILLED: "success",
  PARTIALLY_FULFILLED: "warning",
  UNFULFILLED: "warning",
  ON_HOLD: "danger",
  SCHEDULED: "info",
  IN_PROGRESS: "info",
  OPEN: "warning",
  RESTOCKED: "neutral",
};

const PRODUCT_STATUS_TONES: Record<string, Tone> = {
  ACTIVE: "success",
  DRAFT: "warning",
  ARCHIVED: "neutral",
};

function humanize(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function StatusBadge({
  kind,
  value,
}: {
  kind: "financial" | "fulfillment" | "productStatus";
  value: string | null | undefined;
}) {
  if (!value) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
          TONE_STYLES.neutral,
        )}
      >
        —
      </span>
    );
  }

  const map =
    kind === "financial"
      ? FINANCIAL_TONES
      : kind === "fulfillment"
        ? FULFILLMENT_TONES
        : PRODUCT_STATUS_TONES;

  const tone = map[value] ?? "neutral";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        TONE_STYLES[tone],
      )}
    >
      {humanize(value)}
    </span>
  );
}
