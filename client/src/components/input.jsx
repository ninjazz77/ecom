import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-[1.5rem] border border-white/10 bg-white/8 px-4 py-3 text-sm text-white shadow-[inset_0_10px_30px_rgba(0,0,0,0.18)] transition duration-200 placeholder:text-slate-400 focus-visible:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400/20 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
