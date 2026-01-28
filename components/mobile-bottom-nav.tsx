"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, User, Calendar, Users, Euro, Settings, Dumbbell, Lock, CalendarClock, MoreHorizontal, LogOut, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Platform } from "@/hooks/use-platform"
import { cn } from "@/lib/utils"
import { logout } from "@/actions/auth-actions"

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
    const [showMore, setShowMore] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Close menu when navigating
    useEffect(() => {
        setShowMore(false)
    }, [pathname])

    // Close on escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowMore(false)
        }
        if (showMore) {
            document.addEventListener('keydown', handleEscape)
            return () => document.removeEventListener('keydown', handleEscape)
        }
    }, [showMore])

    const handleClick = useCallback(() => {
        Platform.haptic.light()
    }, [])

    const handleLogout = async () => {
        setIsLoggingOut(true)
        Platform.haptic.medium()
        try {
            await logout()
        } catch (error) {
            console.error('Erreur déconnexion:', error)
            setIsLoggingOut(false)
        }
    }

    // Filter main nav items based on role (keep 4 items + "Plus")
    const visibleItems = navItems.filter(item => {
        if (userRole === "COACH") {
            return item.coachOnly || item.href === "/"
        }
        return !item.coachOnly
    }).slice(0, 4)

    // Filter "more" items based on role
    const visibleMoreItems = moreItems.filter(item => {
        if (item.adminOnly && userRole !== "ADMIN") return false
        return true
    })

    // Check if current page is in "more" items
    const isMoreActive = visibleMoreItems.some(
        item => pathname === item.href || pathname.startsWith(item.href)
    )

    if (!mounted) return null

    return (
        <>
            {/* Overlay */}
            {showMore && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] md:hidden animate-in fade-in duration-200"
                    onClick={() => setShowMore(false)}
                />
            )}

            {/* More Menu Panel */}
            {showMore && (
                <div
                    className={cn(
                        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
                        "bg-card border-t border-border/50 rounded-t-2xl shadow-2xl",
                        "animate-in slide-in-from-bottom duration-300"
                    )}
                    style={{
                        paddingBottom: "calc(80px + var(--safe-area-bottom, env(safe-area-inset-bottom, 0px)))",
                        paddingLeft: "var(--safe-area-left, env(safe-area-inset-left, 0px))",
                        paddingRight: "var(--safe-area-right, env(safe-area-inset-right, 0px))",
                    }}
                >
                    {/* Drag handle */}
                    <div className="flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 pb-3">
                        <h3 className="font-semibold text-sm text-foreground">Menu</h3>
                        <button
                            onClick={() => setShowMore(false)}
                            className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center touch-manipulation"
                        >
                            <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Menu Items */}
                    <div className="px-3 pb-3 space-y-1">
                        {visibleMoreItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== "/" && pathname.startsWith(item.href))
                            const Icon = item.icon

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => {
                                        handleClick()
                                        setShowMore(false)
                                    }}
                                    className={cn(
                                        "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200",
                                        "touch-manipulation select-none active:scale-[0.98]",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-foreground hover:bg-muted/50"
                                    )}
                                    style={{ WebkitTapHighlightColor: 'transparent' }}
                                >
                                    <div className={cn(
                                        "h-10 w-10 rounded-xl flex items-center justify-center",
                                        isActive ? "bg-primary/15" : "bg-muted/50"
                                    )}>
                                        <Icon className={cn(
                                            "h-5 w-5",
                                            isActive ? "text-primary" : "text-muted-foreground"
                                        )} />
                                    </div>
                                    <span className={cn(
                                        "font-medium text-sm",
                                        isActive && "text-primary font-semibold"
                                    )}>
                                        {item.title}
                                    </span>
                                </Link>
                            )
                        })}

                        {/* Separator */}
                        <div className="h-px bg-border/50 mx-4 my-2" />

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3.5 rounded-xl w-full transition-all duration-200",
                                "touch-manipulation select-none active:scale-[0.98]",
                                "text-destructive hover:bg-destructive/10",
                                isLoggingOut && "opacity-50"
                            )}
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-destructive/10">
                                <LogOut className="h-5 w-5 text-destructive" />
                            </div>
                            <span className="font-medium text-sm">
                                {isLoggingOut ? "Déconnexion..." : "Se déconnecter"}
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom Navigation Bar */}
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

                {/* More Button */}
                <button
                    onClick={() => {
                        handleClick()
                        setShowMore(!showMore)
                    }}
                    className={cn(
                        "mobile-nav-item",
                        (showMore || isMoreActive) && "active",
                        "opacity-0 animate-fade-in-up"
                    )}
                    style={{
                        animationDelay: `${visibleItems.length * 50}ms`,
                        animationFillMode: 'forwards',
                        WebkitTapHighlightColor: 'transparent'
                    }}
                >
                    <div className="relative">
                        <MoreHorizontal className={cn(
                            "mobile-nav-icon",
                            (showMore || isMoreActive) && "text-primary"
                        )} />
                        {isMoreActive && !showMore && (
                            <span
                                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-scale-in"
                                aria-hidden="true"
                            />
                        )}
                    </div>
                    <span className={cn(
                        "mobile-nav-label",
                        (showMore || isMoreActive) ? "text-primary font-semibold" : "text-muted-foreground"
                    )}>
                        Plus
                    </span>
                </button>
            </nav>
        </>
    )
}
