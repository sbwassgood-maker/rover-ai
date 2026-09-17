import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "ai" | "dark" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap active:scale-[0.985]";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-white hover:bg-ink/90 shadow-sm",
  secondary:
    "bg-surface text-ink border border-line hover:border-ink/25 hover:bg-white shadow-sm",
  outline:
    "bg-transparent text-ink border border-line hover:border-ink/30",
  ghost: "bg-transparent text-ink hover:bg-ink/5",
  ai: "bg-accent text-white hover:bg-accent-hover shadow-sm",
  dark: "bg-white text-ink hover:bg-white/90",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  href,
  children,
  ...props
}: {
  className?: string;
  variant?: Variant;
  size?: Size;
  href: string;
  children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </Link>
  );
}
