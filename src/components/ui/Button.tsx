import { forwardRef, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import Link, { type LinkProps } from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "destructive";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export const buttonVariantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost:
    "hover:bg-accent hover:text-accent-foreground",
  outline:
    "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

export const buttonSizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-md",
  md: "h-10 px-4 text-sm rounded-lg",
  lg: "h-12 px-6 text-base rounded-xl",
  icon: "h-10 w-10 rounded-lg",
};

const buttonBase =
  "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 cursor-pointer " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          buttonBase,
          buttonVariantStyles[variant],
          buttonSizeStyles[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

// Link-styled as button
interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonBase, buttonVariantStyles[variant], buttonSizeStyles[size], className)}
      {...props}
    >
      {children}
    </Link>
  );
}

interface ButtonAnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function ButtonAnchor({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonAnchorProps) {
  return (
    <a
      className={cn(buttonBase, buttonVariantStyles[variant], buttonSizeStyles[size], className)}
      {...props}
    >
      {children}
    </a>
  );
}
