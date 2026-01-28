import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Base styles
        "flex min-h-[120px] w-full rounded-xl border-2 border-input bg-background/50 px-4 py-3 shadow-sm transition-all duration-200",

        // Typography - 16px on mobile to prevent zoom
        "text-base md:text-sm font-medium leading-relaxed",

        // Resize behavior
        "resize-none",

        // Placeholder
        "placeholder:text-muted-foreground/60",

        // Focus states
        "focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:bg-background",

        // Hover state
        "hover:border-border/80 hover:bg-background/80",

        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50",

        // Error states
        "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-destructive/20",

        className
      )}
      {...props}
    />
  )
}

export { Textarea }
