"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          // Base styles
          "fixed z-50 flex flex-col bg-background shadow-2xl",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "transition-transform duration-300 ease-out",

          // Right side - Default for desktop & mobile
          side === "right" && [
            "inset-y-0 right-0 h-full border-l",
            // Mobile: 90% width with margin
            "w-[90vw] max-w-[420px]",
            // Desktop: fixed width
            "sm:w-[420px] sm:max-w-[420px]",
            // Animations
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
            "data-[state=closed]:duration-200 data-[state=open]:duration-300",
          ],

          // Left side
          side === "left" && [
            "inset-y-0 left-0 h-full border-r",
            "w-[90vw] max-w-[420px]",
            "sm:w-[420px] sm:max-w-[420px]",
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
            "data-[state=closed]:duration-200 data-[state=open]:duration-300",
          ],

          // Top side
          side === "top" && [
            "inset-x-0 top-0 h-auto max-h-[85vh] border-b rounded-b-2xl",
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
          ],

          // Bottom side - Sheet style for mobile modals
          side === "bottom" && [
            "inset-x-0 bottom-0 h-auto max-h-[92vh] border-t rounded-t-2xl",
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          ],

          className
        )}
        style={{
          // Safe area padding - using CSS vars set by SafeAreaProvider with env() fallback
          paddingTop: side === "right" || side === "left"
            ? "var(--safe-area-top, env(safe-area-inset-top, 0px))"
            : undefined,
          paddingBottom: side === "right" || side === "left" || side === "bottom"
            ? "var(--safe-area-bottom, env(safe-area-inset-bottom, 0px))"
            : undefined,
          paddingLeft: side === "left"
            ? "var(--safe-area-left, env(safe-area-inset-left, 0px))"
            : undefined,
          paddingRight: side === "right"
            ? "var(--safe-area-right, env(safe-area-inset-right, 0px))"
            : undefined,
        }}
        {...props}
      >
        {/* Drag handle for bottom sheets */}
        {side === "bottom" && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
          </div>
        )}

        {children}

        {/* Close button */}
        <SheetPrimitive.Close
          className={cn(
            "absolute z-10 rounded-full flex items-center justify-center",
            "bg-muted/80 backdrop-blur-sm",
            "h-9 w-9 touch-manipulation",
            "opacity-80 transition-all hover:opacity-100 hover:bg-muted hover:scale-105",
            "focus:ring-2 focus:ring-primary/20 focus:outline-none",
            "active:scale-95",
            // Position based on side
            side === "bottom" ? "top-3 right-4" : "top-4 right-4",
          )}
          style={{
            top: side !== "bottom"
              ? "calc(1rem + var(--safe-area-top, env(safe-area-inset-top, 0px)))"
              : undefined,
            right: side === "right"
              ? "calc(1rem + var(--safe-area-right, env(safe-area-inset-right, 0px)))"
              : "1rem",
          }}
        >
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Fermer</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        "flex flex-col gap-1.5 px-5 pt-4 pb-3",
        "border-b border-border/50 bg-muted/20",
        className
      )}
      {...props}
    />
  )
}

function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-body"
      className={cn(
        "flex-1 overflow-y-auto overscroll-contain",
        "px-5 py-4",
        className
      )}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "flex flex-col gap-2 px-5 py-4",
        "border-t border-border/50 bg-muted/20",
        className
      )}
      style={{
        paddingBottom: "calc(1rem + var(--safe-area-bottom, env(safe-area-inset-bottom, 0px)))",
      }}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-lg font-bold text-foreground pr-8", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
