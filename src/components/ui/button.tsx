import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-brand-gold text-brand-navy hover:bg-brand-goldHover shadow-xs border border-brand-gold/60 font-bold",
        hero:
          "bg-brand-gold text-brand-navy font-bold shadow-gold hover:bg-brand-goldHover active:bg-amber-600 border border-brand-gold",
        secondary:
          "bg-brand-navy text-white hover:bg-brand-black font-semibold border border-brand-navy shadow-xs",
        navy:
          "bg-brand-navy text-white hover:bg-brand-black font-semibold shadow-xs",
        outline:
          "border border-brand-platinum bg-white text-brand-navy hover:bg-brand-platinumLight hover:text-brand-black shadow-xs dark:bg-brand-navy dark:border-brand-navyLight dark:text-white",
        ghost:
          "text-brand-navy hover:bg-brand-platinumLight hover:text-brand-black dark:text-brand-platinum dark:hover:bg-brand-navyLight",
        destructive:
          "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
        success:
          "bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-xs",
        link:
          "text-brand-navy underline-offset-4 hover:underline hover:text-brand-gold font-semibold dark:text-brand-gold",
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
