import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  size?: number;
  className?: string;
};

/** Minimal SSHUB circular mark (gradient + bolt). Uses `/brand/sshub-mark.svg`. */
export function SshubMark({ size = 32, className }: Props) {
  return (
    <Image
      src="/brand/sshub-mark.svg"
      alt="SSHUB - Premium Mobile Accessories Pakistan"
      width={size}
      height={size}
      className={cn("shrink-0 select-none", className)}
      unoptimized
    />
  );
}
