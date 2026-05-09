import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Nav bar, mobile drawer (lighter on navy), auth cards, or splash. */
  variant?: "nav" | "drawer" | "footer" | "lg" | "splash";
};

/**
 * Logotype "SSHUB" — Playfair Display (`font-display`) + brand gradient.
 * Use beside {@link SshubMark} for full logo lockup.
 */
export function SshubWordmark({ className, variant = "nav" }: Props) {
  return (
    <span
      className={cn(
        "font-display font-black tracking-tight leading-none",
        "bg-clip-text text-transparent bg-gradient-to-r",
        variant === "drawer" && "from-slate-100 via-amber-300 to-amber-400",
        variant !== "drawer" && "from-brand-200 via-accent to-accent-dark",
        variant === "nav" && "text-[15px] sm:text-[17px]",
        variant === "drawer" && "text-[16px]",
        variant === "footer" && "text-lg sm:text-xl",
        variant === "lg" && "text-2xl sm:text-[1.65rem]",
        variant === "splash" && "text-xl sm:text-2xl",
        className,
      )}
    >
      SSHUB
    </span>
  );
}
