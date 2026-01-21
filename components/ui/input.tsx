import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          // --- Layout & Base ---
          "flex h-11 w-full rounded-xl border-2 border-input bg-background/50 px-4 py-2.5 shadow-sm transition-all duration-200",

          // --- Typography (CRUCIAL FOR iOS) ---
          // text-base (16px) on mobile to prevent auto-zoom
          // md:text-sm (14px) on desktop for refinement
          "text-base md:text-sm font-medium",

          // --- File Input Styling ---
          "file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-primary",

          // --- Placeholder & Colors ---
          "placeholder:text-muted-foreground/60",

          // --- Focus States ---
          "focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:bg-background",

          // --- Hover State ---
          "hover:border-border/80 hover:bg-background/80",

          // --- Disabled State ---
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50",

          // --- Error States (Accessibility) ---
          "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-destructive/20",

          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
