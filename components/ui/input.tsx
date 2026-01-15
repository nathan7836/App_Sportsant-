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
          "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 shadow-sm transition-all duration-200",

          // --- Typographie (CRUCIAL POUR IOS) ---
          // text-base (16px) sur mobile pour bloquer le zoom automatique
          // md:text-sm (14px) sur ordinateur pour la finesse
          "text-base md:text-sm",

          // --- File Input Styling ---
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",

          // --- Placeholder & Colors ---
          "placeholder:text-muted-foreground",

          // --- Focus States (Ring animé) ---
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",

          // --- Disabled State ---
          "disabled:cursor-not-allowed disabled:opacity-50",

          // --- Error States (Accessibility) ---
          "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20 dark:aria-[invalid=true]:ring-destructive/40",

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