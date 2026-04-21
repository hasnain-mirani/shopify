import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "outline" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-900 text-white hover:bg-brand-700 active:bg-brand-950 disabled:bg-brand-300",
  outline:
    "border border-brand-900 text-brand-900 bg-transparent hover:bg-brand-900 hover:text-white active:bg-brand-950 disabled:border-brand-300 disabled:text-brand-300",
  ghost:
    "text-brand-600 bg-transparent hover:text-brand-900 hover:bg-brand-100 active:bg-brand-200 disabled:text-brand-300",
  destructive:
    "bg-red-600 text-white hover:bg-red-500 active:bg-red-700 disabled:bg-red-300",
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "h-9 px-5 text-xs",
  md: "h-11 px-8 text-sm",
  lg: "h-12 px-10 text-sm",
  icon: "h-10 w-10 p-0",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium " +
  "transition-all duration-200 ease-out select-none whitespace-nowrap " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-900 focus-visible:ring-offset-2 focus-visible:ring-offset-surface " +
  "disabled:cursor-not-allowed disabled:opacity-70";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      children,
      type,
      ...rest
    },
    ref,
  ) {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        className={cn(BASE, VARIANT_STYLES[variant], SIZE_STYLES[size], className)}
        {...rest}
      >
        {isLoading ? (
          <Spinner size={size === "lg" ? "md" : "sm"} aria-hidden="true" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  },
);

export default Button;
