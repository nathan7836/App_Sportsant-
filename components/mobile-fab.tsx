"use client"

import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import { Platform } from "@/hooks/use-platform"

export function MobileFab() {
    const { toggleSidebar, openMobile } = useSidebar()
    const [isPressed, setIsPressed] = useState(false)
    const [mounted, setMounted] = useState(false)

    // Éviter le flash au montage
    useEffect(() => {
        setMounted(true)
    }, [])

    // Handle click with haptic feedback
    const handleClick = useCallback(() => {
        Platform.haptic.light()
        toggleSidebar()
    }, [toggleSidebar])

    // Handle press states
    const handlePressStart = useCallback(() => {
        setIsPressed(true)
        Platform.haptic.light()
    }, [])

    const handlePressEnd = useCallback(() => {
        setIsPressed(false)
    }, [])

    if (!mounted) return null

    return (
        <Button
            onClick={handleClick}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            onTouchCancel={handlePressEnd}
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            className={`
                fixed z-[100] md:hidden
                h-14 w-14 min-h-[56px] min-w-[56px]
                rounded-full shadow-2xl
                bg-primary text-primary-foreground
                border-2 border-background/50
                flex items-center justify-center
                backdrop-blur-sm
                transition-all duration-200 ease-out
                touch-manipulation
                select-none
                ${isPressed ? 'scale-90 shadow-lg' : 'scale-100'}
                ${openMobile ? 'rotate-90 bg-primary/90' : 'rotate-0'}
            `}
            style={{
                bottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))",
                left: "calc(1.25rem + env(safe-area-inset-left, 0px))",
                WebkitTapHighlightColor: 'transparent',
            }}
            size="icon"
            aria-label={openMobile ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={openMobile}
        >
            <div className={`transition-transform duration-300 ${openMobile ? 'rotate-90' : 'rotate-0'}`}>
                {openMobile ? (
                    <X className="h-6 w-6" strokeWidth={2.5} />
                ) : (
                    <Menu className="h-6 w-6" strokeWidth={2.5} />
                )}
            </div>
        </Button>
    )
}
