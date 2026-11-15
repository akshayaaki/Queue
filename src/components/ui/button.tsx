import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pine focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-brand-pine text-white hover:bg-brand-forest shadow-xs border border-brand-pine font-bold",
        hero:
          "bg-brand-pine text-white font-bold shadow-pine hover:bg-brand-forest active:bg-brand-forest border border-brand-pine",
        secondary:
          "bg-brand-forest text-white hover:bg-brand-black font-semibold border border-brand-forest shadow-xs",
        navy:
          "bg-brand-forest text-white hover:bg-brand-black font-semibold shadow-xs",
        outline:
          "border border-brand-stone bg-white text-brand-forest hover:bg-brand-platinumLight hover:text-brand-forest shadow-xs dark:bg-brand-forest dark:border-brand-pine dark:text-white",
        ghost:
          "text-brand-forest hover:bg-brand-platinumLight hover:text-brand-forest dark:text-brand-stone dark:hover:bg-brand-forest",
        destructive:
          "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
        success:
          "bg-brand-fern text-white font-semibold hover:bg-brand-pine shadow-xs",
        link:
          "text-brand-forest underline-offset-4 hover:underline hover:text-brand-fern font-semibold dark:text-brand-sage",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-6 text-sm font-bold",
        xl: "h-12 rounded-lg px-7 text-base font-bold tracking-tight",
        icon: "h-9 w-9",
        iconSm: "h-7 w-7 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
