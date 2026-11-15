import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-brand-platinum bg-white px-3.5 py-2 text-sm text-brand-navy ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-brand-navy/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:border-brand-gold disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-xs dark:bg-brand-navy dark:border-brand-navyLight dark:text-white dark:placeholder:text-brand-platinum/40",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
