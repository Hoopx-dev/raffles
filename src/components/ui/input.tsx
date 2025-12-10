import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-muted mb-1.5">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "w-full h-12 px-4 bg-bg-input border border-gray-200 rounded-xl text-text-dark placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
            error && "border-danger focus:ring-danger/20 focus:border-danger",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-danger">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
