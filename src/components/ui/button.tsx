import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-palette-ochre text-[#241C14] font-semibold hover:bg-palette-ochreDark hover:text-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_1px_rgba(0,0,0,0.04)] active:shadow-none",
        hero:
          "bg-gradient-to-r from-palette-ochre via-[#DEB887] to-palette-ochreDark text-[#1C160E] font-bold shadow-[0_4px_14px_rgba(212,163,115,0.4)] hover:shadow-[0_6px_20px_rgba(212,163,115,0.5)] hover:scale-[1.01] active:scale-[0.98] border border-palette-bisque/60",
        secondary:
          "bg-palette-bisque/80 text-[#2C241B] hover:bg-palette-bisque font-medium border border-palette-ochre/20",
        sage:
          "bg-palette-sage text-[#202E1B] font-semibold hover:bg-[#BFCB9D] border border-palette-oliveDark/20 shadow-sm",
        outline:
          "border border-border bg-card text-foreground hover:bg-muted/70 hover:border-palette-ochre/40 shadow-xs",
        ghost:
          "hover:bg-muted/80 text-foreground hover:text-foreground",
        destructive:
          "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900",
        link:
          "text-palette-ochreDark underline-offset-4 hover:underline dark:text-palette-ochre",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-7 text-base font-semibold",
        xl: "h-14 rounded-xl px-9 text-lg font-bold tracking-tight",
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
