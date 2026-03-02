import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95";

    const variants = {
      default:
        "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800",
      destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
      outline: "border border-gray-200 bg-white hover:bg-gray-50 text-gray-900",
      secondary:
        "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300",
      ghost: "hover:bg-gray-100 text-gray-900 active:bg-gray-200",
      link: "text-emerald-600 underline-offset-4 hover:underline",
    };

    const sizes = {
      default: "h-10 px-4 py-2 text-sm sm:h-10 sm:px-4",
      sm: "h-8 px-2 text-xs sm:px-3",
      lg: "h-12 px-6 text-base sm:px-8",
      icon: "h-10 w-10 sm:h-11 sm:w-11",
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
