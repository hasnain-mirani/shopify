import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export type InputVariant = "underline" | "outline";
export type InputSize = "sm" | "md" | "lg";

type NativeInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
>;

export interface InputProps extends NativeInputProps {
  label?: string;
  hint?: string;
  error?: string;
  variant?: InputVariant;
  inputSize?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** When true, hides the <label> visually but keeps it for screen readers. */
  hideLabel?: boolean;
}

const WRAPPER_VARIANTS: Record<InputVariant, string> = {
  underline:
    "border-b border-brand-300 focus-within:border-brand-900 bg-transparent",
  outline:
    "border border-brand-300 focus-within:border-brand-900 rounded-xl bg-white",
};

const WRAPPER_ERROR: Record<InputVariant, string> = {
  underline: "border-red-500 focus-within:border-red-600",
  outline: "border-red-500 focus-within:border-red-600",
};

const SIZE_STYLES: Record<InputSize, string> = {
  sm: "h-9 text-sm",
  md: "h-11 text-sm",
  lg: "h-12 text-base",
};

const PADDING: Record<InputVariant, string> = {
  underline: "px-0",
  outline: "px-4",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    variant = "outline",
    inputSize = "md",
    leftIcon,
    rightIcon,
    hideLabel = false,
    id,
    className,
    disabled,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedByIds: string[] = [];
  if (hint) describedByIds.push(`${inputId}-hint`);
  if (error) describedByIds.push(`${inputId}-error`);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            "text-xs font-medium uppercase tracking-wider text-brand-600",
            hideLabel && "sr-only",
          )}
        >
          {label}
        </label>
      )}

      <div
        className={cn(
          "flex items-center gap-2 transition-colors duration-200",
          WRAPPER_VARIANTS[variant],
          PADDING[variant],
          SIZE_STYLES[inputSize],
          error && WRAPPER_ERROR[variant],
          disabled && "opacity-60 cursor-not-allowed",
        )}
      >
        {leftIcon && (
          <span className="inline-flex shrink-0 text-brand-500">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedByIds.join(" ") || undefined}
          className={cn(
            "flex-1 min-w-0 bg-transparent outline-none border-0 text-brand-900 placeholder:text-brand-400 disabled:cursor-not-allowed",
            className,
          )}
          {...rest}
        />

        {rightIcon && (
          <span className="inline-flex shrink-0 text-brand-500">
            {rightIcon}
          </span>
        )}
      </div>

      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-brand-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
