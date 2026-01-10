
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { NewClientSheet } from "@/components/clients/new-client-sheet"
import { ClientList } from "@/components/clients/client-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default async function ClientsPage() {
    const session = await auth()
    if (!session) redirect("/login")

    const clients = await prisma.client.findMany({
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Clients</h2>
                    <p className="text-muted-foreground">Suivi athlètes, santé et objectifs.</p>
                </div>
                <NewClientSheet />
            </div>

            <Card className="border-border/50 shadow-md">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium">Répertoire</CardTitle>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Rechercher (nom, objectif)..."
                                className="pl-8 bg-background/50"
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
