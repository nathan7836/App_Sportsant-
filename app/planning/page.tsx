
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { NewSessionSheet } from "@/components/planning/new-session-sheet"
import { PlanningView } from "@/components/planning/planning-view"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ChevronLeft, ChevronRight, AlertTriangle, CalendarDays } from "lucide-react"
import Link from "next/link"

export default async function PlanningPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
    const session = await auth()
    if (!session) redirect("/login")

    // Await params for next.js 15+ compat if needed, though 14 works.
    // In Next 15 searchParams is a promise
    const params = await searchParams
    const dateParam = params.date

    // Resolve current date
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let currentDate = dateParam ? new Date(dateParam) : today
    if (isNaN(currentDate.getTime())) currentDate = today

    // Calculate Prev / Next
    const prevDate = new Date(currentDate)
    prevDate.setDate(prevDate.getDate() - 1)

    const nextDate = new Date(currentDate)
    nextDate.setDate(nextDate.getDate() + 1)

    // Helper to format YYYY-MM-DD
    const toISODate = (d: Date) => d.toISOString().split('T')[0]

    // Date range for query
    const startOfDay = new Date(currentDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(currentDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Fetch necessary data
    const [clients, coaches, services, sessions] = await Promise.all([
        prisma.client.findMany({ orderBy: { name: 'asc' } }),
        prisma.user.findMany({
            where: { role: 'COACH' },
            orderBy: { name: 'asc' }
        }),
        prisma.service.findMany({ orderBy: { name: 'asc' } }),
        prisma.session.findMany({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                coachId: session.user.role === 'COACH' ? session.user.id : undefined
            },
            include: {
                client: true,
                coach: true,
                service: true
            },
            orderBy: { date: 'asc' }
        })
    ])

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0 min-h-0 flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Planning</h2>
                    <p className="text-muted-foreground">Organisation des séances et workflow mensuel.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-muted/50 rounded-lg p-1 mr-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={`/planning?date=${toISODate(prevDate)}`}>
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="ghost" className="h-8 text-sm font-medium px-3" asChild>
                            <Link href="/planning">
                                Aujourd'hui
                            </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={`/planning?date=${toISODate(nextDate)}`}>
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <NewSessionSheet clients={clients} coaches={coaches} services={services} />
                </div>
            </div>

            {/* Workflow Alerts (e.g. End of Month) */}
            <Alert className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/20 text-amber-800 dark:text-amber-400 shrink-0">
                <AlertTriangle className="h-4 w-4 stroke-amber-600 dark:stroke-amber-400" />
                <AlertTitle>Régularisation Fin de Mois</AlertTitle>
                <AlertDescription className="text-xs">
                    N'oubliez pas de valider le statut "Effectuée" des séances du mois passé pour générer la facturation.
                </AlertDescription>
            </Alert>

            <div className="grid lg:grid-cols-7 gap-6 flex-1 overflow-hidden min-h-0">
                {/* Sidebar Calendar */}
                <Card className="lg:col-span-2 h-fit border-border/50 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> Calendrier</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center pb-4">
                        <Calendar
                            mode="single"
                            className="rounded-md border-0"
                            selected={currentDate}
                        // Note: full calendar nav requires client component with router logic, for now purely visual or could link
                        />
                    </CardContent>
                    <div className="px-6 pb-6 space-y-3">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Légende Statuts</div>
                        <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200"></div> Planifiée</div>
                        <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600"></div> Confirmée / Effectuée</div>
                        <div className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded-full bg-rose-100 border border-rose-200 line-through decoration-rose-400"></div> Annulée</div>
                    </div>
                </Card>

                {/* Agenda View */}
                <PlanningView
                    sessions={sessions}
                    coaches={coaches}
                    currentDate={currentDate}
                    userRole={session.user?.role}
                    currentUserId={session.user?.id}
                />
            </div>
        </div>
    )
}
