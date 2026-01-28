'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetBody,
    SheetFooter,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import {
    AlertTriangle,
    Calendar,
    CalendarX,
    CalendarClock,
    Clock,
    Send,
    User,
    Info
} from "lucide-react"
import { createSessionChangeRequest } from "@/actions/session-request-actions"
import { useActionState } from "react"
import { toast } from "sonner"

interface SessionChangeRequestSheetProps {
    session: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

// Créneaux horaires
const TIME_SLOTS = [
    { label: "8h", value: "08:00" },
    { label: "9h", value: "09:00" },
    { label: "10h", value: "10:00" },
    { label: "11h", value: "11:00" },
    { label: "12h", value: "12:00" },
    { label: "14h", value: "14:00" },
    { label: "15h", value: "15:00" },
    { label: "16h", value: "16:00" },
    { label: "17h", value: "17:00" },
    { label: "18h", value: "18:00" },
    { label: "19h", value: "19:00" },
    { label: "20h", value: "20:00" },
]

export function SessionChangeRequestSheet({ session, open, onOpenChange }: SessionChangeRequestSheetProps) {
    const [state, formAction, isPending] = useActionState(createSessionChangeRequest, null)
    const [requestType, setRequestType] = useState<'CANCEL' | 'RESCHEDULE'>('CANCEL')
    const [reason, setReason] = useState("")
    const [newDate, setNewDate] = useState("")
    const [newTime, setNewTime] = useState("")

    // Calculer si on peut faire une demande (24h avant)
    const sessionDate = session ? new Date(session.date) : new Date()
    const now = new Date()
    const hoursUntilSession = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    const canRequest = hoursUntilSession >= 24

    // Reset form on close
    useEffect(() => {
        if (!open) {
            setRequestType('CANCEL')
            setReason("")
            setNewDate("")
            setNewTime("")
        }
    }, [open])

    // Handle success/error
    useEffect(() => {
        if (state?.success) {
            toast.success(state.message || "Demande envoyée !")
            onOpenChange(false)
        }
        if (state?.error) {
            toast.error(state.error)
        }
    }, [state, onOpenChange])

    if (!session) return null

    // Format date for display
    const formatDisplayDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <CalendarClock className="h-5 w-5 text-primary" />
                        Demande de modification
                    </SheetTitle>
                    <SheetDescription>
                        Séance avec {session.client.name}
                    </SheetDescription>
                </SheetHeader>

                <SheetBody>
                {/* Session Info Card */}
                <Card className="p-3 bg-muted/30 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">{session.client.name}</p>
                            <p className="text-sm text-muted-foreground">{session.service.name}</p>
                            <p className="text-sm text-primary font-medium capitalize">
                                {formatDisplayDate(sessionDate)}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Warning if less than 24h */}
                {!canRequest && (
                    <Card className="p-4 mb-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-amber-800 dark:text-amber-300">
                                    Demande impossible
                                </p>
                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                    Vous ne pouvez pas modifier une séance moins de 24h avant son début.
                                    Contactez directement l'administration.
                                </p>
                            </div>
                        </div>
                    </Card>
                )}

                {canRequest && (
                    <form action={formAction} id="request-change-form" className="space-y-4">
                        <input type="hidden" name="sessionId" value={session.id} />
                        <input type="hidden" name="type" value={requestType} />
                        <input type="hidden" name="newDate" value={newDate} />
                        <input type="hidden" name="newTime" value={newTime} />

                        {/* Request Type Selection */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">Type de demande</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                        requestType === 'CANCEL'
                                            ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-500 text-rose-700 dark:text-rose-300'
                                            : 'bg-muted/30 border-transparent hover:bg-muted'
                                    }`}
                                    onClick={() => setRequestType('CANCEL')}
                                >
                                    <CalendarX className="h-8 w-8" />
                                    <span className="font-semibold">Annuler</span>
                                    <span className="text-xs text-center opacity-80">
                                        Annuler la séance
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                        requestType === 'RESCHEDULE'
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300'
                                            : 'bg-muted/30 border-transparent hover:bg-muted'
                                    }`}
                                    onClick={() => setRequestType('RESCHEDULE')}
                                >
                                    <CalendarClock className="h-8 w-8" />
                                    <span className="font-semibold">Reporter</span>
                                    <span className="text-xs text-center opacity-80">
                                        Proposer une nouvelle date
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* New Date/Time (if RESCHEDULE) */}
                        {requestType === 'RESCHEDULE' && (
                            <div className="space-y-4 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2 font-semibold">
                                        <Calendar className="h-4 w-4 text-blue-600" />
                                        Nouvelle date proposée
                                    </Label>
                                    <Input
                                        type="date"
                                        value={newDate}
                                        onChange={(e) => setNewDate(e.target.value)}
                                        className="h-12"
                                        min={new Date().toISOString().split('T')[0]}
                                        required={requestType === 'RESCHEDULE'}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2 font-semibold">
                                        <Clock className="h-4 w-4 text-blue-600" />
                                        Nouvelle heure
                                    </Label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {TIME_SLOTS.map((slot) => (
                                            <Button
                                                key={slot.value}
                                                type="button"
                                                variant={newTime === slot.value ? "default" : "outline"}
                                                size="sm"
                                                className={`h-10 ${newTime === slot.value ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
                                                onClick={() => setNewTime(slot.value)}
                                            >
                                                {slot.label}
                                            </Button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">ou:</span>
                                        <Input
                                            type="time"
                                            value={newTime}
                                            onChange={(e) => setNewTime(e.target.value)}
                                            className="w-32 h-10"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reason */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">
                                Motif de la demande <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                name="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Expliquez la raison de votre demande..."
                                className="min-h-[100px] resize-none"
                                required
                            />
                        </div>

                        {/* Info */}
                        <Card className="p-3 bg-muted/30">
                            <div className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                <p className="text-xs text-muted-foreground">
                                    Votre demande sera envoyée pour validation.
                                </p>
                            </div>
                        </Card>
                    </form>
                )}
                </SheetBody>

                {canRequest && (
                    <SheetFooter>
                        <Button
                            type="submit"
                            form="request-change-form"
                            className="w-full h-11 font-semibold gap-2"
                            disabled={isPending || !reason || (requestType === 'RESCHEDULE' && (!newDate || !newTime))}
                        >
                            {isPending ? "Envoi..." : <><Send className="h-4 w-4" /> Envoyer la demande</>}
                        </Button>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    )
}
