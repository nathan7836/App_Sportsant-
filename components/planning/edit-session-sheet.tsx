'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetBody, SheetFooter, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { updateSession, deleteSession } from "@/actions/planning-actions"
import { useActionState, useState, useEffect } from "react"
import { User } from "@prisma/client"
import { toast } from "sonner"
import {
    Trash2,
    Calendar,
    Clock,
    Dumbbell,
    User as UserIcon,
    Check,
    X,
    CalendarCheck,
    Play,
    AlertTriangle,
    Save,
    CalendarClock
} from "lucide-react"
import { SessionChangeRequestSheet } from "./session-change-request-sheet"

interface EditSessionSheetProps {
    session: any
    coaches: User[]
    open: boolean
    onOpenChange: (open: boolean) => void
    userRole?: string
    currentUserId?: string
}

// Status workflow
const STATUS_OPTIONS = [
    { value: 'PLANNED', label: 'Planifiée', icon: Calendar, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'CONFIRMED', label: 'Confirmée', icon: CalendarCheck, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { value: 'DONE', label: 'Effectuée', icon: Check, color: 'bg-green-100 text-green-700 border-green-200' },
    { value: 'CANCELLED', label: 'Annulée', icon: X, color: 'bg-rose-100 text-rose-700 border-rose-200' },
]

// Créneaux horaires courants
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

export function EditSessionSheet({ session, coaches, open, onOpenChange, userRole, currentUserId }: EditSessionSheetProps) {
    const [updateState, updateAction, isUpdatePending] = useActionState(updateSession, null)
    const [deleteState, deleteAction, isDeletePending] = useActionState(deleteSession, null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showRequestSheet, setShowRequestSheet] = useState(false)

    // Check if user is coach and this is their session
    const isCoach = userRole === 'COACH'
    const isAdmin = userRole === 'ADMIN'
    const isOwnSession = session?.coachId === currentUserId

    // Check if can request change (24h before)
    const sessionDate = session ? new Date(session.date) : new Date()
    const now = new Date()
    const hoursUntilSession = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    const canRequestChange = hoursUntilSession >= 24

    // Form state
    const [selectedDate, setSelectedDate] = useState("")
    const [selectedTime, setSelectedTime] = useState("")
    const [selectedCoach, setSelectedCoach] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("")
    const [notes, setNotes] = useState("")

    // Initialize form when session changes
    useEffect(() => {
        if (session && open) {
            const sessionDate = new Date(session.date)
            setSelectedDate(sessionDate.toISOString().split('T')[0])
            setSelectedTime(`${sessionDate.getHours().toString().padStart(2, '0')}:${sessionDate.getMinutes().toString().padStart(2, '0')}`)
            setSelectedCoach(session.coachId)
            setSelectedStatus(session.status || 'PLANNED')
            setNotes(session.notes || "")
            setShowDeleteConfirm(false)
        }
    }, [session, open])

    // Handle success/error
    useEffect(() => {
        if (updateState?.success) {
            toast.success("Séance modifiée avec succès !")
            onOpenChange(false)
        }
        if (updateState?.error) {
            toast.error(updateState.error)
        }
        if (deleteState?.success) {
            toast.success("Séance supprimée")
            onOpenChange(false)
        }
    }, [updateState, deleteState, onOpenChange])

    if (!session) return null

    // Format date for display
    const formatDisplayDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        })
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <CalendarCheck className="h-5 w-5 text-primary" />
                        Modifier la Séance
                    </SheetTitle>
                    <SheetDescription className="truncate">
                        {session.service.name} avec {session.client.name}
                    </SheetDescription>
                </SheetHeader>

                <SheetBody>
                {/* Current Session Info Card */}
                <Card className="p-3 bg-muted/30 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <UserIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold">{session.client.name}</p>
                                <p className="text-sm text-muted-foreground">{session.client.phone || session.client.email}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-lg text-primary">{session.service.price}€</p>
                            <p className="text-xs text-muted-foreground">{session.service.durationMin} min</p>
                        </div>
                    </div>
                </Card>

                <form action={updateAction} id="edit-session-form" className="space-y-4">
                    <input type="hidden" name="sessionId" value={session.id} />
                    <input type="hidden" name="date" value={selectedDate} />
                    <input type="hidden" name="time" value={selectedTime} />
                    <input type="hidden" name="coachId" value={selectedCoach} />
                    <input type="hidden" name="status" value={selectedStatus} />
                    <input type="hidden" name="notes" value={notes} />

                    {/* 1. STATUS SELECTION - Most important action */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-base font-semibold">
                            <Play className="h-4 w-4 text-primary" />
                            Statut de la séance
                        </Label>

                        <div className="grid grid-cols-2 gap-2">
                            {STATUS_OPTIONS.map((status) => {
                                const Icon = status.icon
                                const isSelected = selectedStatus === status.value
                                return (
                                    <button
                                        key={status.value}
                                        type="button"
                                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                                            isSelected
                                                ? `${status.color} border-current ring-2 ring-offset-2`
                                                : "bg-muted/30 border-transparent hover:bg-muted"
                                        }`}
                                        onClick={() => setSelectedStatus(status.value)}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span className="font-medium text-sm">{status.label}</span>
                                    </button>
                                )
                            })}
                        </div>

                        {selectedStatus === 'CANCELLED' && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 text-sm">
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                <p>La séance sera marquée comme annulée mais conservée dans l'historique.</p>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* 2. DATE SELECTION */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-base font-semibold">
                            <Calendar className="h-4 w-4 text-primary" />
                            Date
                        </Label>
                        <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="h-12 text-base"
                        />
                        {selectedDate && (
                            <p className="text-sm text-muted-foreground capitalize">
                                {formatDisplayDate(selectedDate)}
                            </p>
                        )}
                    </div>

                    <Separator />

                    {/* 3. TIME SELECTION */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-base font-semibold">
                            <Clock className="h-4 w-4 text-primary" />
                            Heure
                        </Label>

                        {/* Quick time slots */}
                        <div className="grid grid-cols-6 gap-2">
                            {TIME_SLOTS.map((slot) => (
                                <Button
                                    key={slot.value}
                                    type="button"
                                    variant={selectedTime === slot.value ? "default" : "outline"}
                                    size="sm"
                                    className={`h-10 ${selectedTime === slot.value ? "ring-2 ring-primary ring-offset-2" : ""}`}
                                    onClick={() => setSelectedTime(slot.value)}
                                >
                                    {slot.label}
                                </Button>
                            ))}
                        </div>

                        {/* Custom time input */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">ou personnalisé:</span>
                            <Input
                                type="time"
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                className="w-32 h-10"
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* 4. COACH SELECTION */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-base font-semibold">
                            <Dumbbell className="h-4 w-4 text-primary" />
                            Coach
                        </Label>

                        <div className="grid gap-2">
                            {coaches.map((coach) => (
                                <button
                                    key={coach.id}
                                    type="button"
                                    className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                                        selectedCoach === coach.id
                                            ? "bg-primary/10 border-2 border-primary"
                                            : "hover:bg-muted border-2 border-transparent"
                                    }`}
                                    onClick={() => setSelectedCoach(coach.id)}
                                >
                                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                                        {(coach.name || coach.email).substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{coach.name || coach.email}</p>
                                        <p className="text-xs text-muted-foreground">Coach</p>
                                    </div>
                                    {selectedCoach === coach.id && (
                                        <Check className="h-5 w-5 text-primary" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* 5. NOTES */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">Notes</Label>
                        <Textarea
                            placeholder="Informations complémentaires..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="min-h-[60px] resize-none"
                        />
                    </div>

                    {/* REQUEST CHANGE SECTION (for coaches) */}
                    {isCoach && isOwnSession && (
                        <div className="pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full gap-2 border-amber-200 text-amber-700 hover:bg-amber-50"
                                onClick={() => setShowRequestSheet(true)}
                                disabled={!canRequestChange}
                            >
                                <CalendarClock className="h-4 w-4" />
                                {canRequestChange ? "Demander une modification" : "Impossible (< 24h)"}
                            </Button>
                        </div>
                    )}

                    {/* DELETE SECTION (admin only) */}
                    {isAdmin && (
                        <div className="pt-4 border-t">
                            {!showDeleteConfirm ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => setShowDeleteConfirm(true)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Supprimer la séance
                                </Button>
                            ) : (
                                <Card className="p-3 bg-destructive/5 border-destructive/20">
                                    <div className="flex items-center gap-2 mb-2 text-destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <p className="font-semibold text-sm">Confirmer ?</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => setShowDeleteConfirm(false)}
                                        >
                                            Annuler
                                        </Button>
                                        <form action={deleteAction} className="flex-1">
                                            <input type="hidden" name="sessionId" value={session.id} />
                                            <Button
                                                type="submit"
                                                variant="destructive"
                                                size="sm"
                                                className="w-full"
                                                disabled={isDeletePending}
                                            >
                                                {isDeletePending ? "..." : "Supprimer"}
                                            </Button>
                                        </form>
                                    </div>
                                </Card>
                            )}
                        </div>
                    )}
                </form>
                </SheetBody>

                <SheetFooter>
                    <Button
                        type="submit"
                        form="edit-session-form"
                        className="w-full h-11 font-semibold gap-2"
                        disabled={isUpdatePending || isDeletePending}
                    >
                        {isUpdatePending ? "Enregistrement..." : <><Save className="h-4 w-4" /> Enregistrer</>}
                    </Button>
                </SheetFooter>

                {/* Session Change Request Sheet */}
                <SessionChangeRequestSheet
                    session={session}
                    open={showRequestSheet}
                    onOpenChange={setShowRequestSheet}
                />
            </SheetContent>
        </Sheet>
    )
}
