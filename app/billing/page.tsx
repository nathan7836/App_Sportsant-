
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Download, TrendingUp, Wallet, CalendarCheck, User } from "lucide-react"
import { DownloadReportButton } from "@/components/billing/download-report-button"

export default async function BillingPage() {
    const session = await auth()
    if (!session) redirect("/login")

    // 1. Fetch all sessions (in a real app, we'd filter by month e.g. using searchParams)
    // For this MVP, we take everything to show data.
    const sessions = await prisma.session.findMany({
        include: {
            service: true,
            coach: {
                include: {
                    coachDetails: true
                }
            },
            client: true
        },
        orderBy: { date: 'desc' }
    })

    // 2. Calculate Financials
    let totalRevenue = 0
    let totalCoachCost = 0

    // Group by Client for "Factures Clients"
    const clientBillings: Record<string, { client: any, count: number, total: number, status: string }> = {}

    // Group by Coach for "Rémunération"
    const coachBillings: Record<string, { coach: any, hours: number, cost: number, rate: number }> = {}

    for (const s of sessions) {
        // Revenue
        // We assume all sessions contribute to Revenue for "Facturation" projection
        // Realistically, only DONE or CONFIRMED might count.
        totalRevenue += s.service.price

        // Cost
        // We need coach hourly rate. If missing, assume default (e.g. 40€)
        const rate = s.coach.coachDetails?.hourlyRate || 40
        const durationHours = s.service.durationMin / 60
        const cost = durationHours * rate
        totalCoachCost += cost

        // Client Aggregation
        if (!clientBillings[s.clientId]) {
            clientBillings[s.clientId] = {
                client: s.client,
                count: 0,
                total: 0,
                status: s.status === 'DONE' ? 'Payée' : 'En attente' // Simplified logic
            }
        }
        clientBillings[s.clientId].count += 1
        clientBillings[s.clientId].total += s.service.price
        // Conservative status: if any session is not DONE, mark pending (or just mix)
        if (s.status !== 'DONE') clientBillings[s.clientId].status = 'En attente'


        // Coach Aggregation
        if (!coachBillings[s.coachId]) {
            coachBillings[s.coachId] = {
                coach: s.coach,
                hours: 0,
                cost: 0,
                rate: rate
            }
        }
        coachBillings[s.coachId].hours += durationHours
        coachBillings[s.coachId].cost += cost
    }

    const netProfit = totalRevenue - totalCoachCost
    const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0"

    const clientRows = Object.values(clientBillings)
    const coachRows = Object.values(coachBillings)

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Finances</h2>
                    <p className="text-muted-foreground">Facturation & Rentabilité (Sur l'ensemble de la période).</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><CalendarCheck className="mr-2 h-4 w-4" /> Tout voir</Button>
                    <DownloadReportButton
                        revenue={totalRevenue}
                        expense={totalCoachCost}
                        profit={netProfit}
                        clientData={clientRows}
                    />
                </div>
            </div>

            {/* Financial Logic P&L */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* CA */}
                <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 bg-white/20 rounded-full blur-2xl"></div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-white/80 flex justify-between">
                            Chiffre d'Affaires
                            <TrendingUp className="h-4 w-4 text-emerald-300" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-extrabold">€ {totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-white/60 mt-1">Total {sessions.length} séances</p>
                    </CardContent>
                </Card>

                {/* Coach Cost */}
                <Card className="border-l-4 border-l-rose-500 shadow-md">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Dépenses Coachs</CardTitle>
                        <User className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">€ {totalCoachCost.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Estim. Salaire</p>
                        <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                                <span>Budget utilisé</span>
                                <span>{sessions.length} séances</span> // Simplified
                            </div>
                            <Progress value={margin === "0.0" ? 0 : 50} className="h-1.5 bg-rose-100 [&>div]:bg-rose-500" />
                        </div>
                    </CardContent>
                </Card>

                {/* Profit */}
                <Card className="border-l-4 border-l-emerald-500 shadow-md bg-emerald-50/50 dark:bg-emerald-900/10">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Bénéfice Net</CardTitle>
                        <Wallet className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-extrabold text-emerald-700 dark:text-emerald-400">€ {netProfit.toLocaleString()}</div>
                        <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1 font-medium">Marge estimée: {margin}%</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 shadow-md">
                    <CardHeader>
                        <CardTitle>Factures Clients</CardTitle>
                        <CardDescription>Aggregation par client.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Séances</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clientRows.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-6">Aucune donnée</TableCell>
                                    </TableRow>
                                )}
                                {clientRows.map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium">{row.client.name}</TableCell>
                                        <TableCell>{row.count}</TableCell>
                                        <TableCell>€ {row.total}</TableCell>
                                        <TableCell>
                                            <Badge variant={row.status === 'Payée' ? 'default' : 'outline'} className={row.status === 'Payée' ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-0" : "text-amber-600 border-amber-200"}>
                                                {row.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right"><Button variant="ghost" size="sm">PDF</Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Rémunération Coachs</CardTitle>
                        <CardDescription>Estimations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {coachRows.length === 0 && (
                            <p className="text-center text-muted-foreground py-4">Aucune donnée</p>
                        )}
                        {coachRows.map((row, i) => (
                            <div key={i} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback>{row.coach.name ? row.coach.name.substring(0, 2).toUpperCase() : 'CO'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-sm">{row.coach.name || row.coach.email}</p>
                                        <p className="text-xs text-muted-foreground">{row.hours} heures</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm">€ {row.cost}</p>
                                    <p className="text-xs text-muted-foreground">{row.rate}€/h</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
