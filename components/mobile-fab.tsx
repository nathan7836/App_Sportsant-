"use client"

import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function MobileFab() {
    const { toggleSidebar, open } = useSidebar()

    // Always show FAB on mobile, toggle action handles the state
    // if (open) return null 

    return (
        <Button
            onClick={toggleSidebar}
            className="fixed bottom-6 left-6 z-[100] h-14 w-14 rounded-full shadow-xl bg-primary text-primary-foreground hover:scale-105 transition-all duration-300 md:hidden border-2 border-background flex items-center justify-center"
            size="icon"
            aria-label="Ouvrir le menu"
        >
            <Menu className="h-6 w-6" />
        </Button>
    )
}
