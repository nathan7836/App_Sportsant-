import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { NewClientSheet } from "@/components/clients/new-client-sheet"
import { ClientList } from "@/components/clients/client-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Users, UserPlus } from "lucide-react"

export default async function ClientsPage() {
    const session = await auth()
    if (!session) redirect("/login")

    const clients = await prisma.client.findMany({
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-6 pb-4">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight gradient-text">
                            Clients
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        Gérez vos athlètes, leur santé et leurs objectifs
                    </p>
                </div>
                <NewClientSheet />
            </div>

            {/* Main Card */}
            <Card className="premium-card animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <UserPlus className="h-4 w-4 text-primary" />
                            Répertoire
                            <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                {clients.length} client{clients.length > 1 ? 's' : ''}
                            </span>
                        </CardTitle>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Rechercher un client..."
                                className="pl-10 h-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ClientList clients={clients} currentUserRole={session.user?.role} />
                </CardContent>
            </Card>
        </div>
    )
}
