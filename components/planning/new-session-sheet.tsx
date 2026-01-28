'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetBody, SheetFooter, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    Plus,
    Calendar,
    Clock,
    User,
    Dumbbell,
    Euro,
    Check,
    Search,
    X,
    Repeat,
    ChevronRight,
    CalendarPlus,
    Loader2
} from "lucide-react"
import { createSession } from "@/actions/planning-actions"
import { useActionState, useState, useEffect, useMemo } from "react"
import { Client, User as UserType, Service } from "@prisma/client"
import { toast } from "sonner"
import { TIME_SLOTS, DAYS_OF_WEEK } from "@/lib/constants"
import { formatDisplayDate } from "@/lib/date-utils"

interface NewSessionSheetProps {
    clients: Client[]
    coaches: UserType[]
    services: Service[]
}

export function NewSessionSheet({ clients, coaches, services }: NewSessionSheetProps) {
    const [open, setOpen] = useState(false)
    const [state, formAction, isPending] = useActionState(createSession, null)

    // Form state
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date()
        return today.toISOString().split('T')[0]
    })
    const [selectedTime, setSelectedTime] = useState("")
    const [selectedCoach, setSelectedCoach] = useState("")
    const [selectedClient, setSelectedClient] = useState("")
    const [selectedService, setSelectedService] = useState("")
    const [clientSearch, setClientSearch] = useState("")
    const [showRecurrence, setShowRecurrence] = useState(false)
    const [notes, setNotes] = useState("")

    // Selected objects for display
    const selectedClientObj = clients.find(c => c.id === selectedClient)
    const selectedCoachObj = coaches.find(c => c.id === selectedCoach)
    const selectedServiceObj = services.find(s => s.id === selectedService)

    // Filter clients by search
    const filteredClients = useMemo(() => {
        if (!clientSearch) return clients
        const search = clientSearch.toLowerCase()
        return clients.filter(c =>
            c.name.toLowerCase().includes(search) ||
            c.phone?.toLowerCase().includes(search) ||
            c.email?.toLowerCase().includes(search)
        )
    }, [clients, clientSearch])

    // Reset form on close
    useEffect(() => {
        if (!open) {
            setSelectedTime("")
            setSelectedCoach("")
            setSelectedClient("")
            setSelectedService("")
            setClientSearch("")
            setShowRecurrence(false)
            setNotes("")
        }
    }, [open])

    // Handle success
    useEffect(() => {
        if (state?.success) {
            toast.success("Séance planifiée avec succès !")
            setOpen(false)
        }
        if (state?.error) {
            toast.error(state.error)
        }
    }, [state])

    // Check if form is complete
    const isFormComplete = selectedDate && selectedTime && selectedCoach && selectedClient && selectedService

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button className="gap-2 shadow-lg">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Nouvelle</span> Séance
                </Button>
            </SheetTrigger>

            <SheetContent>
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <CalendarPlus className="h-5 w-5 text-primary" />
                        Nouvelle Séance
                    </SheetTitle>
                    <SheetDescription>
                        Planifiez une session de coaching
                    </SheetDescription>
                </SheetHeader>

                <SheetBody>
                    <form action={formAction} id="session-form" className="space-y-5">
                        {/* Hidden fields */}
                        <input type="hidden" name="date" value={selectedDate ? new Date(selectedDate).toLocaleDateString('fr-FR') : ""} />
                        <input type="hidden" name="time" value={selectedTime} />
                        <input type="hidden" name="coachId" value={selectedCoach} />
                        <input type="hidden" name="clientId" value={selectedClient} />
                        <input type="hidden" name="serviceId" value={selectedService} />
                        <input type="hidden" name="notes" value={notes} />

                        {/* 1. DATE */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                Date
                            </Label>
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                            {selectedDate && (
                                <p className="text-xs text-muted-foreground capitalize">
                                    {formatDisplayDate(selectedDate)}
                                </p>
                            )}
                        </div>

                        {/* 2. TIME */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-primary" />
                                Heure
                            </Label>
                            <div className="grid grid-cols-4 gap-1.5">
                                {TIME_SLOTS.map((slot) => (
                                    <Button
                                        key={slot.value}
                                        type="button"
                                        variant={selectedTime === slot.value ? "default" : "outline"}
                                        size="sm"
                                        className={`h-9 text-xs ${selectedTime === slot.value ? "ring-2 ring-primary/30 ring-offset-1" : ""}`}
                                        onClick={() => setSelectedTime(slot.value)}
                                    >
                                        {slot.label}
                                    </Button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">ou</span>
                                <Input
                                    type="time"
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    className="w-28 h-9"
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* 3. CLIENT */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-primary" />
                                Client
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={clientSearch}
                                    onChange={(e) => setClientSearch(e.target.value)}
                                    className="pl-9"
                                />
                                {clientSearch && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                        onClick={() => setClientSearch("")}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                            <div className="max-h-36 overflow-y-auto space-y-1.5 rounded-lg border p-2">
                                {filteredClients.length === 0 ? (
                                    <p className="text-center py-3 text-muted-foreground text-xs">Aucun client trouvé</p>
                                ) : (
                                    filteredClients.slice(0, 8).map((client) => (
                                        <button
                                            key={client.id}
                                            type="button"
                                            className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left transition-all ${
                                                selectedClient === client.id
                                                    ? "bg-primary/10 border border-primary/30"
                                                    : "hover:bg-muted border border-transparent"
                                            }`}
                                            onClick={() => {
                                                setSelectedClient(client.id)
                                                setClientSearch("")
                                            }}
                                        >
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                                {client.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{client.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {client.phone || client.email || "-"}
                                                </p>
                                            </div>
                                            {selectedClient === client.id && (
                                                <Check className="h-4 w-4 text-primary shrink-0" />
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* 4. COACH */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                <Dumbbell className="h-3.5 w-3.5 text-primary" />
                                Coach
                            </Label>
                            <div className="grid gap-1.5">
                                {coaches.map((coach) => (
                                    <button
                                        key={coach.id}
                                        type="button"
                                        className={`flex items-center gap-2.5 p-2.5 rounded-lg text-left transition-all ${
                                            selectedCoach === coach.id
                                                ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-300/50"
                                                : "hover:bg-muted border border-transparent"
                                        }`}
                                        onClick={() => setSelectedCoach(coach.id)}
                                    >
                                        <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 font-bold text-xs shrink-0">
                                            {(coach.name || coach.email).substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{coach.name || coach.email}</p>
                                        </div>
                                        {selectedCoach === coach.id && (
                                            <Check className="h-4 w-4 text-amber-600 shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* 5. SERVICE */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                <Euro className="h-3.5 w-3.5 text-primary" />
                                Prestation
                            </Label>
                            <div className="grid gap-1.5">
                                {services.map((service) => (
                                    <button
                                        key={service.id}
                                        type="button"
                                        className={`flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                                            selectedService === service.id
                                                ? "bg-primary text-primary-foreground shadow-md"
                                                : "bg-muted/50 hover:bg-muted"
                                        }`}
                                        onClick={() => setSelectedService(service.id)}
                                    >
                                        <div className="min-w-0">
                                            <p className="font-semibold text-sm truncate">{service.name}</p>
                                            <p className={`text-xs ${selectedService === service.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                                {service.durationMin} min
                                            </p>
                                        </div>
                                        <span className="text-lg font-bold shrink-0 ml-2">{service.price}€</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 6. NOTES */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">
                                Notes (optionnel)
                            </Label>
                            <Textarea
                                placeholder="Informations complémentaires..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="min-h-[60px] resize-none"
                            />
                        </div>

                        {/* 7. RECURRENCE */}
                        <div className="space-y-2">
                            <button
                                type="button"
                                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setShowRecurrence(!showRecurrence)}
                            >
                                <Repeat className="h-3.5 w-3.5" />
                                {showRecurrence ? "Masquer" : "Ajouter"} une récurrence
                                <ChevronRight className={`h-3.5 w-3.5 transition-transform ${showRecurrence ? "rotate-90" : ""}`} />
                            </button>

                            {showRecurrence && (
                                <Card className="p-3 space-y-3 bg-muted/30">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Répéter chaque:</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {DAYS_OF_WEEK.map((day) => (
                                                <label key={day.key} className="flex items-center gap-1.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name={`day_${day.key}`}
                                                        className="h-4 w-4 rounded"
                                                    />
                                                    <span className="text-xs">{day.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Jusqu'au:</Label>
                                        <Input
                                            type="date"
                                            name="recurrenceEndDate"
                                            min={selectedDate}
                                            className="h-9"
                                        />
                                    </div>
                                    <input type="hidden" name="isRecurring" value="on" />
                                </Card>
                            )}
                        </div>

                        {/* SUMMARY */}
                        {isFormComplete && (
                            <Card className="p-3 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                                <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                                    <Check className="h-4 w-4 text-primary" />
                                    Récapitulatif
                                </h4>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Date</span>
                                        <span className="font-medium capitalize">{formatDisplayDate(selectedDate)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Heure</span>
                                        <span className="font-medium">{selectedTime}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Client</span>
                                        <span className="font-medium truncate ml-2">{selectedClientObj?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Coach</span>
                                        <span className="font-medium truncate ml-2">{selectedCoachObj?.name || selectedCoachObj?.email}</span>
                                    </div>
                                    <Separator className="my-1.5" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">{selectedServiceObj?.name}</span>
                                        <span className="font-bold text-base text-primary">{selectedServiceObj?.price}€</span>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </form>
                </SheetBody>

                <SheetFooter>
                    <Button
                        type="submit"
                        form="session-form"
                        className="w-full h-12 text-base font-semibold gap-2"
                        disabled={isPending || !isFormComplete}
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <CalendarPlus className="h-4 w-4" />
                        )}
                        Planifier la séance
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
