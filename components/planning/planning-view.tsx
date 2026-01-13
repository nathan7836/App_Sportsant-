'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, MapPin, Plus } from "lucide-react"
import { useState } from "react"
import { EditSessionSheet } from "./edit-session-sheet"
import type { User } from "@/types/prisma"

interface SessionWithDetails {
    id: string
    date: Date
    status: string
    client: { name: string }
    coach: { name: string | null, email: string }
    service: { name: string, durationMin: number }
    notes?: string | null
    coachId: string
}

interface PlanningViewProps {
    sessions: SessionWithDetails[]
    coaches: User[]
    currentDate: Date
}

export function PlanningView({ sessions, coaches, currentDate }: PlanningViewProps) {
    const [selectedSession, setSelectedSession] = useState<SessionWithDetails | null>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)

    // Generate slots from 8:00 to 20:00
    const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8)

    // Sort sessions by date
    const sortedSessions = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Helper to format hour
    const formatHour = (h: number) => `${h}:00`

    // Format date for display (e.g., "Mardi 12 Décembre")
    const formattedDate = new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    }).format(currentDate)

    // Capitalize first letter
    const displayDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

    // Group sessions by hour (simple implementation for daily view)
    const getSessionForHour = (hour: number) => {
        return sortedSessions.find(s => {
            const d = new Date(s.date)
            return d.getHours() === hour
        })
    }

    // Helper for status badge styles
    const getStatusStyle = (status: string) => {
        switch (status) {
            case "CONFIRMED": return "bg-emerald-500 text-white hover:bg-emerald-600"
            case "DONE": return "bg-blue-500 text-white hover:bg-blue-600"
            case "CANCELLED": return "bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200"
            default: return "bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200" // PLANNED
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "CONFIRMED": return "Confirmée"
            case "DONE": return "Terminée"
            case "CANCELLED": return "Annulée"
            default: return "Planifiée"
        }
    }

    const handleSessionClick = (session: SessionWithDetails) => {
        setSelectedSession(session)
        setIsEditOpen(true)
    }

    return (
        <>
            <Card className="lg:col-span-5 border-border/50 shadow-sm flex flex-col overflow-hidden bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm h-full">
                <CardHeader className="pb-4 shrink-0 border-b border-border/40">
                    <div className="flex justify-between items-center">
                        <CardTitle>{displayDate}</CardTitle>
                        <Badge variant="secondary" className="font-normal">{sessions.length} Séances</Badge>
                    </div>
                </CardHeader>
                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6">
                        {timeSlots.map((hour) => {
                            const session = getSessionForHour(hour)
                            const isCancelled = session?.status === "CANCELLED"

                            return (
                                <div key={hour} className="flex gap-4 group min-h-[100px]">
                                    <div className="w-14 text-right text-sm text-muted-foreground font-medium pt-2">
                                        {formatHour(hour)}
                                    </div>
                                    <div className="flex-1 border-b border-border/50 pb-6 group-last:border-0 relative">
                                        {session ? (
                                            <div
                                                onClick={() => handleSessionClick(session)}
                                                className={`relative z-10 border-l-4 ${isCancelled ? 'border-l-rose-400 bg-rose-50' : 'border-l-primary bg-primary/5'} rounded-r-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className={`font-bold ${isCancelled ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                                            {session.service.name}
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {session.client.name} avec {session.coach.name || session.coach.email}
                                                        </p>
                                                    </div>
                                                    <Badge className={`pointer-events-none ${getStatusStyle(session.status)} border-0 shadow-none font-semibold`}>
                                                        {getStatusLabel(session.status)}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                                                    <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {session.service.durationMin} min</span>
                                                    <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> Domicile Client</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-full w-full border border-dashed border-border/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer mx-4">
                                                <span className="text-xs text-muted-foreground flex items-center">
                                                    <Plus className="h-3 w-3 mr-1" /> Créneau disponible
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </Card>

            <EditSessionSheet
                session={selectedSession}
                coaches={coaches}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />
        </>
    )
}
