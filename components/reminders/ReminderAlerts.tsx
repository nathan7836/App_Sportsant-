'use client'

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    AlertTriangle,
    Bell,
    Calendar,
    CalendarCheck,
    CheckCircle2,
    ChevronRight,
    Clock,
    X
} from "lucide-react"
import Link from "next/link"

interface Session {
    id: string
    date: Date
    status: string
    client: { name: string }
    service: { name: string }
}

interface ReminderAlertsProps {
    upcomingSessions: Session[]
    pendingValidationCount: number
    userRole: string
}

export function ReminderAlerts({ upcomingSessions, pendingValidationCount, userRole }: ReminderAlertsProps) {
    const [dismissed, setDismissed] = useState<string[]>([])
    const [currentDate] = useState(new Date())

    // Check if we're near end of month (after 25th)
    const dayOfMonth = currentDate.getDate()
    const isEndOfMonth = dayOfMonth >= 25
    const isAroundThe20th = dayOfMonth >= 18 && dayOfMonth <= 22

    // Sessions in next 24h
    const next24h = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
    const sessionsIn24h = upcomingSessions.filter(s => {
        const sessionDate = new Date(s.date)
        return sessionDate >= currentDate && sessionDate <= next24h && s.status !== 'CANCELLED'
    })

    // Sessions tomorrow
    const tomorrow = new Date(currentDate)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

    const sessionsTomorrow = upcomingSessions.filter(s => {
        const sessionDate = new Date(s.date)
        return sessionDate >= tomorrow && sessionDate < dayAfterTomorrow && s.status !== 'CANCELLED'
    })

    const isDismissed = (key: string) => dismissed.includes(key)
    const dismiss = (key: string) => setDismissed([...dismissed, key])

    return (
        <div className="space-y-4">
            {/* Rappel 24h avant séance */}
            {sessionsIn24h.length > 0 && !isDismissed('24h') && (
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 relative">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <AlertTitle className="text-blue-800 dark:text-blue-300 flex items-center gap-2">
                        Séances dans les 24 prochaines heures
                        <Badge className="bg-blue-100 text-blue-700 border-0">{sessionsIn24h.length}</Badge>
                    </AlertTitle>
                    <AlertDescription className="text-blue-700/80 dark:text-blue-400/80">
                        <div className="mt-2 space-y-2">
                            {sessionsIn24h.slice(0, 3).map(session => (
                                <div key={session.id} className="flex items-center gap-2 text-sm">
                                    <Clock className="h-3 w-3" />
                                    <span className="font-medium">{session.service.name}</span>
                                    <span>avec {session.client.name}</span>
                                    <span className="text-blue-600">
                                        {new Date(session.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                            {sessionsIn24h.length > 3 && (
                                <p className="text-xs">et {sessionsIn24h.length - 3} autre(s)...</p>
                            )}
                        </div>
                    </AlertDescription>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 h-6 w-6 text-blue-600 hover:bg-blue-100"
                        onClick={() => dismiss('24h')}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </Alert>
            )}

            {/* Rappel planification mensuelle (vers le 20) */}
            {isAroundThe20th && userRole === 'COACH' && !isDismissed('monthly') && (
                <Alert className="bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 relative">
                    <Calendar className="h-5 w-5 text-violet-600" />
                    <AlertTitle className="text-violet-800 dark:text-violet-300">
                        Planification du mois prochain
                    </AlertTitle>
                    <AlertDescription className="text-violet-700/80 dark:text-violet-400/80">
                        <p className="mt-1">
                            Pensez à planifier vos séances pour le mois prochain. Contactez vos clients pour confirmer leurs disponibilités.
                        </p>
                        <Button
                            size="sm"
                            variant="outline"
                            className="mt-3 border-violet-300 text-violet-700 hover:bg-violet-100"
                            asChild
                        >
                            <Link href="/planning">
                                <CalendarCheck className="h-4 w-4 mr-2" /> Accéder au planning
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    </AlertDescription>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 h-6 w-6 text-violet-600 hover:bg-violet-100"
                        onClick={() => dismiss('monthly')}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </Alert>
            )}

            {/* Régularisation fin de mois */}
            {isEndOfMonth && pendingValidationCount > 0 && !isDismissed('endofmonth') && (
                <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 relative">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <AlertTitle className="text-amber-800 dark:text-amber-300 flex items-center gap-2">
                        Régularisation Fin de Mois
                        <Badge className="bg-amber-100 text-amber-700 border-0">{pendingValidationCount} à valider</Badge>
                    </AlertTitle>
                    <AlertDescription className="text-amber-700/80 dark:text-amber-400/80">
                        <p className="mt-1">
                            N'oubliez pas de valider le statut "Effectuée" des séances du mois pour générer la facturation correctement.
                        </p>
                        <Button
                            size="sm"
                            variant="outline"
                            className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100"
                            asChild
                        >
                            <Link href="/planning">
                                <CheckCircle2 className="h-4 w-4 mr-2" /> Valider les séances
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    </AlertDescription>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 h-6 w-6 text-amber-600 hover:bg-amber-100"
                        onClick={() => dismiss('endofmonth')}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </Alert>
            )}
        </div>
    )
}
