
"use client"

import Link from "next/link"
import { Calendar, CreditCard, Home, Settings, Users, User, Euro, Dumbbell, Lock, CalendarClock } from "lucide-react"

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

// Menu items.
const items = [
    {
        title: "Tableau de bord",
        url: "/",
        icon: Home,
    },
    {
        title: "Clients",
        url: "/clients",
        icon: User,
    },
    {
        title: "Planning",
        url: "/planning",
        icon: Calendar,
    },
    {
        title: "Coachs",
        url: "/coaches",
        icon: Users,
    },
    {
        title: "Services",
        url: "/services",
        icon: Dumbbell,
    },
    {
        title: "Facturation",
        url: "/billing",
        icon: Euro,
    },
]

export function AppSidebar({ userRole, ...props }: React.ComponentProps<typeof Sidebar> & { userRole?: string }) {
    const { setOpenMobile } = useSidebar()

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="p-4 border-b">
                <h2 className="text-xl font-bold text-primary tracking-tight">SportSanté</h2>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.filter(item => {
                                if (userRole === "COACH") {
                                    return item.title === "Planning" || item.title === "Tableau de bord" // Maybe Dashboard too? Plan says "only Assigned planning". 
                                    // User said: "uniquement une vue sur les coaching qui leurs sont attribué... il ne peut pas avoir acces au planning du coach b"
                                    // And "coach a a acces a un planning".
                                    // Usually Dashboard has global stats they shouldn't see?
                                    // Let's stick to Planning as requested. "uniquement une vue sur les coaching".
                                    // I'll keep Planning. I'll remove Dashboard if it shows global stats.
                                    // Current Dashboard (/page.tsx) shows "Derniers inscrits", "Revenue". Coach shouldn't see Revenue.
                                    // So ONLY Planning.
                                    return item.title === "Planning"
                                }
                                return true
                            }).map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title} className="hover:bg-primary/10 hover:text-primary transition-colors duration-200">
                                        <Link href={item.url} onClick={() => setOpenMobile(false)}>
                                            <item.icon />
                                            <span className="font-medium">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}

                            {userRole === "ADMIN" && (
                                <>
                                    <SidebarMenuItem key="Admin Users">
                                        <SidebarMenuButton asChild tooltip="Gestion Utilisateurs" className="hover:bg-primary/10 hover:text-primary transition-colors duration-200">
                                            <Link href="/admin/users" onClick={() => setOpenMobile(false)}>
                                                <Lock />
                                                <span className="font-medium">Gestion Utilisateurs</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem key="Admin Requests">
                                        <SidebarMenuButton asChild tooltip="Demandes" className="hover:bg-primary/10 hover:text-primary transition-colors duration-200">
                                            <Link href="/admin/requests" onClick={() => setOpenMobile(false)}>
                                                <CalendarClock />
                                                <span className="font-medium">Demandes</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Paramètres">
                            <Link href="/settings">
                                <Settings />
                                <span>Paramètres</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
