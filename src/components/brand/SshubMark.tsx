import { cn } from "@/lib/utils";

type Props = {
  size?: number;
  className?: string;
};

/** Minimal SSHUB circular mark (gradient + bolt). Uses `/brand/sshub-mark.svg`. */
export function SshubMark({ size = 32, className }: Props) {
  return (
    <img
      src="/brand/sshub-mark.svg"
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 select-none", className)}
      decoding="async"
    />
  );
}
