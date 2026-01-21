"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, User, Calendar, Users, Euro, Settings, Dumbbell, Lock, CalendarClock } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Platform } from "@/hooks/use-platform"
import { cn } from "@/lib/utils"

interface NavItem {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    adminOnly?: boolean
    coachOnly?: boolean
}

const navItems: NavItem[] = [
    { title: "Accueil", href: "/", icon: Home },
    { title: "Clients", href: "/clients", icon: User },
    { title: "Planning", href: "/planning", icon: Calendar, coachOnly: true },
    { title: "Coachs", href: "/coaches", icon: Users },
    { title: "Services", href: "/services", icon: Dumbbell },
]

const moreItems: NavItem[] = [
    { title: "Facturation", href: "/billing", icon: Euro },
    { title: "Utilisateurs", href: "/admin/users", icon: Lock, adminOnly: true },
    { title: "Demandes", href: "/admin/requests", icon: CalendarClock, adminOnly: true },
    { title: "Paramètres", href: "/settings", icon: Settings },
]

interface MobileBottomNavProps {
    userRole?: string
}

export function MobileBottomNav({ userRole }: MobileBottomNavProps) {
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleClick = useCallback(() => {
        Platform.haptic.light()
    }, [])

    // Filter items based on role
    const visibleItems = navItems.filter(item => {
        if (userRole === "COACH") {
            return item.coachOnly || item.href === "/"
        }
        return !item.coachOnly
    }).slice(0, 5) // Max 5 items for mobile nav

    if (!mounted) return null

    return (
        <nav
            className="mobile-nav"
            role="navigation"
            aria-label="Navigation principale mobile"
        >
            {visibleItems.map((item, index) => {
                const isActive = pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href))
                const Icon = item.icon

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={handleClick}
                        className={cn(
                            "mobile-nav-item",
                            isActive && "active",
                            "opacity-0 animate-fade-in-up"
                        )}
                        style={{
                            animationDelay: `${index * 50}ms`,
                            animationFillMode: 'forwards',
                            WebkitTapHighlightColor: 'transparent'
                        }}
                        aria-current={isActive ? "page" : undefined}
                    >
                        <div className="relative">
                            <Icon className={cn(
                                "mobile-nav-icon",
                                isActive && "text-primary"
                            )} />
                            {isActive && (
                                <span
                                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-scale-in"
                                    aria-hidden="true"
                                />
                            )}
                        </div>
                        <span className={cn(
                            "mobile-nav-label",
                            isActive ? "text-primary font-semibold" : "text-muted-foreground"
                        )}>
                            {item.title}
                        </span>
                    </Link>
                )
            })}
        </nav>
    )
}
