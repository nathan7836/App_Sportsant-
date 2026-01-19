import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getPendingRequests } from "@/actions/session-request-actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    CalendarClock,
    CalendarX,
    Calendar,
    User,
    Clock,
    AlertCircle
} from "lucide-react"
import { RequestCard } from "@/components/admin/RequestCard"

export const dynamic = 'force-dynamic'

export default async function AdminRequestsPage() {
    const session = await auth()

    if (!session || session.user?.role !== 'ADMIN') {
        redirect("/")
    }

    const pendingRequests = await getPendingRequests()

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                        <CalendarClock className="h-7 w-7 text-primary" />
                        Demandes de modification
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gérez les demandes d'annulation et de report des coachs
                    </p>
                </div>
                {pendingRequests.length > 0 && (
                    <Badge className="bg-amber-100 text-amber-700 border-0 text-lg px-3 py-1">
                        {pendingRequests.length} en attente
                    </Badge>
                )}
            </div>

            {/* Pending Requests */}
            {pendingRequests.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="py-16 text-center">
                        <CalendarClock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                        <h3 className="font-semibold text-lg mb-1">Aucune demande en attente</h3>
                        <p className="text-muted-foreground text-sm">
                            Les demandes de modification des coachs apparaîtront ici
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {pendingRequests.map((request) => (
                        <RequestCard key={request.id} request={request} />
                    ))}
                </div>
            )}
        </div>
    )
}
