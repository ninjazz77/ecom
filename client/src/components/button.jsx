import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

/* eslint-disable react-refresh/only-export-components */
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "ripple inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-extrabold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "brand-gradient text-white shadow-[0_16px_42px_rgba(144,0,255,0.25)] hover:-translate-y-1 hover:shadow-[0_22px_56px_rgba(255,62,181,0.28)]",
        destructive:
          "bg-[#ff3e5f] text-white shadow-[0_14px_40px_rgba(255,62,95,0.25)] hover:-translate-y-1 hover:bg-[#ff2149]",
        outline:
          "border-2 border-[#171421] bg-white/90 text-[#171421] shadow-[4px_4px_0_#171421] hover:-translate-y-1 hover:shadow-[6px_6px_0_#171421]",
        secondary:
          "brand-gradient-green text-[#171421] shadow-[0_14px_36px_rgba(255,138,0,0.18)] hover:-translate-y-1",
        ghost: "text-[#171421] hover:bg-white/70 hover:text-fuchsia-700",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-full px-4",
        lg: "h-12 rounded-full px-6",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
