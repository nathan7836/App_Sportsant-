'use client'

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, MapPin, Plus } from "lucide-react"
import { useState } from "react"
import { EditSessionSheet } from "./edit-session-sheet"
import { User } from "@prisma/client"
import { formatDisplayDate } from "@/lib/date-utils"
import { getStatusStyle, getStatusLabel } from "@/lib/constants"

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

    // Use centralized date formatting
    const displayDate = formatDisplayDate(currentDate)

    // Group sessions by hour (returns all sessions for a given hour)
    const getSessionsForHour = (hour: number) => {
        return sortedSessions.filter(s => {
            const d = new Date(s.date)
            return d.getHours() === hour
        })
    }

    const handleSessionClick = (session: SessionWithDetails) => {
        setSelectedSession(session)
        setIsEditOpen(true)
    }

    return (
        <>
            <Card className="col-span-full md:col-span-3 lg:col-span-5 border-border/50 shadow-sm flex flex-col overflow-hidden bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm h-full">
                <CardHeader className="pb-3 sm:pb-4 shrink-0 border-b border-border/40 px-4 sm:px-6">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-base sm:text-lg">{displayDate}</CardTitle>
                        <Badge variant="secondary" className="font-normal text-xs">{sessions.length} Séance{sessions.length > 1 ? 's' : ''}</Badge>
                    </div>
                </CardHeader>
                <ScrollArea className="flex-1 p-3 sm:p-6">
                    <div className="space-y-4 sm:space-y-6">
                        {timeSlots.map((hour) => {
                            const hourSessions = getSessionsForHour(hour)

                            return (
                                <div key={hour} className="flex gap-2 sm:gap-4 group min-h-[80px] sm:min-h-[100px]">
                                    <div className="w-10 sm:w-14 text-right text-xs sm:text-sm text-muted-foreground font-medium pt-2">
                                        {formatHour(hour)}
                                    </div>
                                    <div className="flex-1 border-b border-border/50 pb-4 sm:pb-6 group-last:border-0 relative">
                                        {hourSessions.length > 0 ? (
                                            <div className="space-y-2 sm:space-y-3">
                                                {hourSessions.map((session) => {
                                                    const isCancelled = session.status === "CANCELLED"
                                                    return (
                                                        <div
                                                            key={session.id}
                                                            onClick={() => handleSessionClick(session)}
                                                            className={`relative z-10 border-l-4 ${isCancelled ? 'border-l-rose-400 bg-rose-50 dark:bg-rose-900/20' : 'border-l-primary bg-primary/5'} rounded-r-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]`}
                                                        >
                                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                                                                <div className="min-w-0 flex-1">
                                                                    <h4 className={`font-bold text-sm sm:text-base truncate ${isCancelled ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                                                        {session.service.name}
                                                                    </h4>
                                                                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                                        {session.client.name} avec {session.coach.name || session.coach.email}
                                                                    </p>
                                                                </div>
                                                                <Badge className={`pointer-events-none ${getStatusStyle(session.status)} border-0 shadow-none font-semibold text-xs shrink-0 self-start`}>
                                                                    {getStatusLabel(session.status)}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center gap-3 sm:gap-4 text-xs text-muted-foreground mt-2 sm:mt-3">
                                                                <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {session.service.durationMin} min</span>
                                                                <span className="flex items-center hidden sm:flex"><MapPin className="h-3 w-3 mr-1" /> Domicile</span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <div className="h-full w-full border border-dashed border-border/40 rounded-lg items-center justify-center hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
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
