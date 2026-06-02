import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

/* eslint-disable react-refresh/only-export-components */
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[1.5rem] text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:h-4 [&_svg]:w-4",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-cyan-400 via-sky-500 to-fuchsia-500 text-slate-950 shadow-[0_22px_65px_rgba(56,189,248,0.24)] hover:-translate-y-0.5",
        destructive:
          "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-[0_20px_55px_rgba(244,63,94,0.22)] hover:-translate-y-0.5",
        outline:
          "border border-white/15 bg-white/10 text-white hover:bg-white/15 hover:border-white/20",
        secondary:
          "bg-white/10 text-white shadow-[0_18px_45px_rgba(255,255,255,0.08)] hover:bg-white/15",
        ghost: "bg-transparent text-white hover:bg-white/10",
        link: "bg-transparent px-0 text-cyan-300 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6",
        sm: "h-10 px-4",
        lg: "h-14 px-8",
        icon: "h-11 w-11 p-0",
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
