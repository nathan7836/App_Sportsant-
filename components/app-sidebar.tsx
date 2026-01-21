"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, CreditCard, Home, Settings, Users, User, Euro, Dumbbell, Lock, CalendarClock, LogOut, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarRail,
    SidebarFooter,
} from "@/components/ui/sidebar"
import { useSidebar } from "@/components/ui/sidebar"

// Menu items with improved structure
const mainMenuItems = [
    {
        title: "Tableau de bord",
        url: "/",
        icon: Home,
        description: "Vue d'ensemble",
    },
    {
        title: "Clients",
        url: "/clients",
        icon: User,
        description: "Gestion clients",
    },
    {
        title: "Planning",
        url: "/planning",
        icon: Calendar,
        description: "Calendrier",
    },
    {
        title: "Coachs",
        url: "/coaches",
        icon: Users,
        description: "Équipe",
    },
    {
        title: "Services",
        url: "/services",
        icon: Dumbbell,
        description: "Offres",
    },
    {
        title: "Facturation",
        url: "/billing",
        icon: Euro,
        description: "Finances",
    },
]

const adminMenuItems = [
    {
        title: "Utilisateurs",
        url: "/admin/users",
        icon: Lock,
        description: "Gestion accès",
    },
    {
        title: "Demandes",
        url: "/admin/requests",
        icon: CalendarClock,
        description: "Requêtes",
    },
]

export function AppSidebar({ userRole, ...props }: React.ComponentProps<typeof Sidebar> & { userRole?: string }) {
    const { setOpenMobile, isMobile, state } = useSidebar()
    const pathname = usePathname()

    // Handle navigation with auto-close on mobile
    const handleNavClick = () => {
        if (isMobile) {
            setOpenMobile(false)
        }
    }

    // Filter items based on role
    const visibleMainItems = mainMenuItems.filter(item => {
        if (userRole === "COACH") {
            return item.url === "/" || item.url === "/planning"
        }
        return true
    })

    const isCollapsed = state === "collapsed"

    return (
        <Sidebar collapsible="icon" {...props}>
            {/* Header with Logo */}
            <SidebarHeader
                className="border-b border-sidebar-border/50"
                style={{
                    paddingTop: "calc(1.25rem + env(safe-area-inset-top, 0px))",
                    paddingBottom: "1rem",
                    paddingLeft: "1rem",
                    paddingRight: "1rem",
                }}
            >
                <Link
                    href="/"
                    className="flex items-center gap-3 group"
                    onClick={handleNavClick}
                >
                    <div className="relative">
                        <div className="absolute -inset-1 hero-gradient rounded-xl blur-sm opacity-50 group-hover:opacity-70 transition-opacity" />
                        <div className="relative h-9 w-9 rounded-xl hero-gradient flex items-center justify-center shadow-lg">
                            <Dumbbell className="h-5 w-5 text-white" strokeWidth={2.5} />
                        </div>
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <span className="text-lg font-bold tracking-tight gradient-text">
                                SportSanté
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                Gestion Coach
                            </span>
                        </div>
                    )}
                </Link>
            </SidebarHeader>

            {/* Main Content */}
            <SidebarContent className="py-4 px-2">
                {/* Main Menu */}
                <SidebarGroup>
                    <SidebarGroupLabel className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold mb-2">
                        Menu Principal
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1">
                            {visibleMainItems.map((item) => {
                                const isActive = pathname === item.url ||
                                    (item.url !== "/" && pathname.startsWith(item.url))

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            tooltip={item.title}
                                            isActive={isActive}
                                            className={cn(
                                                "relative h-11 px-3 rounded-xl transition-all duration-200",
                                                "hover:bg-sidebar-accent/80 active:scale-[0.98]",
                                                "touch-manipulation select-none",
                                                isActive && "bg-primary/10 text-primary hover:bg-primary/15"
                                            )}
                                        >
                                            <Link
                                                href={item.url}
                                                onClick={handleNavClick}
                                                style={{ WebkitTapHighlightColor: 'transparent' }}
                                            >
                                                <div className={cn(
                                                    "flex items-center justify-center h-8 w-8 rounded-lg transition-colors",
                                                    isActive ? "bg-primary/10" : "bg-transparent"
                                                )}>
                                                    <item.icon className={cn(
                                                        "h-[18px] w-[18px] shrink-0 transition-colors",
                                                        isActive ? "text-primary" : "text-muted-foreground"
                                                    )} />
                                                </div>
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <span className={cn(
                                                        "font-medium text-sm truncate",
                                                        isActive && "text-primary"
                                                    )}>
                                                        {item.title}
                                                    </span>
                                                    {!isCollapsed && (
                                                        <span className="text-[10px] text-muted-foreground/70 truncate">
                                                            {item.description}
                                                        </span>
                                                    )}
                                                </div>
                                                {isActive && !isCollapsed && (
                                                    <ChevronRight className="h-4 w-4 text-primary/60" />
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Admin Menu */}
                {userRole === "ADMIN" && (
                    <SidebarGroup className="mt-4">
                        <SidebarGroupLabel className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold mb-2">
                            Administration
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="space-y-1">
                                {adminMenuItems.map((item) => {
                                    const isActive = pathname === item.url ||
                                        pathname.startsWith(item.url)

                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                tooltip={item.title}
                                                isActive={isActive}
                                                className={cn(
                                                    "relative h-11 px-3 rounded-xl transition-all duration-200",
                                                    "hover:bg-sidebar-accent/80 active:scale-[0.98]",
                                                    "touch-manipulation select-none",
                                                    isActive && "bg-primary/10 text-primary hover:bg-primary/15"
                                                )}
                                            >
                                                <Link
                                                    href={item.url}
                                                    onClick={handleNavClick}
                                                    style={{ WebkitTapHighlightColor: 'transparent' }}
                                                >
                                                    <div className={cn(
                                                        "flex items-center justify-center h-8 w-8 rounded-lg transition-colors",
                                                        isActive ? "bg-primary/10" : "bg-transparent"
                                                    )}>
                                                        <item.icon className={cn(
                                                            "h-[18px] w-[18px] shrink-0 transition-colors",
                                                            isActive ? "text-primary" : "text-muted-foreground"
                                                        )} />
                                                    </div>
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <span className={cn(
                                                            "font-medium text-sm truncate",
                                                            isActive && "text-primary"
                                                        )}>
                                                            {item.title}
                                                        </span>
                                                        {!isCollapsed && (
                                                            <span className="text-[10px] text-muted-foreground/70 truncate">
                                                                {item.description}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {isActive && !isCollapsed && (
                                                        <ChevronRight className="h-4 w-4 text-primary/60" />
                                                    )}
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter
                className="border-t border-sidebar-border/50"
                style={{
                    paddingTop: "1rem",
                    paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
                    paddingLeft: "0.5rem",
                    paddingRight: "0.5rem",
                }}
            >
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip="Paramètres"
                            className={cn(
                                "h-11 px-3 rounded-xl transition-all duration-200",
                                "hover:bg-sidebar-accent/80 active:scale-[0.98]",
                                "touch-manipulation select-none",
                                pathname === "/settings" && "bg-primary/10 text-primary"
                            )}
                        >
                            <Link
                                href="/settings"
                                onClick={handleNavClick}
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                                <div className="flex items-center justify-center h-8 w-8 rounded-lg">
                                    <Settings className={cn(
                                        "h-[18px] w-[18px] shrink-0",
                                        pathname === "/settings" ? "text-primary" : "text-muted-foreground"
                                    )} />
                                </div>
                                <span className={cn(
                                    "font-medium text-sm",
                                    pathname === "/settings" && "text-primary"
                                )}>
                                    Paramètres
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}
