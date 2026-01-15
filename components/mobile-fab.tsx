"use client"

import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function MobileFab() {
    const { toggleSidebar, openMobile } = useSidebar()

    return (
        <Button
            onClick={toggleSidebar}
            className="fixed z-[100] h-14 w-14 rounded-full shadow-2xl bg-primary text-primary-foreground active:scale-95 hover:scale-105 transition-all duration-200 md:hidden border-2 border-background/50 flex items-center justify-center backdrop-blur-sm"
            style={{
                bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
                left: "calc(1.5rem + env(safe-area-inset-left, 0px))"
            }}
            size="icon"
            aria-label={openMobile ? "Fermer le menu" : "Ouvrir le menu"}
        >
            {openMobile ? (
                <X className="h-6 w-6 transition-transform duration-200" />
            ) : (
                <Menu className="h-6 w-6 transition-transform duration-200" />
            )}
        </Button>
    )
}
