'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
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
    ChevronRight,
    Search,
    X,
    Repeat,
    CalendarPlus
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
                <Button className="bg-primary text-primary-foreground shadow-lg font-bold gap-2">
                    <Plus className="h-4 w-4" /> Séance
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader className="pb-4">
                    <SheetTitle className="flex items-center gap-2">
                        <CalendarPlus className="h-5 w-5 text-primary" />
                        Nouvelle Séance
                    </SheetTitle>
                    <SheetDescription>
                        Planifiez rapidement une session de coaching
                    </SheetDescription>
                </SheetHeader>

                <form action={formAction} className="space-y-6">
                    {/* Hidden fields for form submission */}
                    <input type="hidden" name="date" value={selectedDate ? new Date(selectedDate).toLocaleDateString('fr-FR') : ""} />
                    <input type="hidden" name="time" value={selectedTime} />
                    <input type="hidden" name="coachId" value={selectedCoach} />
                    <input type="hidden" name="clientId" value={selectedClient} />
                    <input type="hidden" name="serviceId" value={selectedService} />
                    <input type="hidden" name="notes" value={notes} />

                    {/* 1. DATE SELECTION */}
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
                            min={new Date().toISOString().split('T')[0]}
                        />
                        {selectedDate && (
                            <p className="text-sm text-muted-foreground capitalize">
                                {formatDisplayDate(selectedDate)}
                            </p>
                        )}
                    </div>

                    <Separator />

                    {/* 2. TIME SELECTION */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-base font-semibold">
                            <Clock className="h-4 w-4 text-primary" />
                            Heure
                        </Label>

                        {/* Quick time slots - Responsive grid */}
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {TIME_SLOTS.map((slot) => (
                                <Button
                                    key={slot.value}
                                    type="button"
                                    variant={selectedTime === slot.value ? "default" : "outline"}
                                    size="sm"
                                    className={`h-11 sm:h-10 text-sm ${selectedTime === slot.value ? "ring-2 ring-primary ring-offset-2" : ""}`}
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

                    {/* 3. CLIENT SELECTION */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-base font-semibold">
                            <User className="h-4 w-4 text-primary" />
                            Client
                        </Label>

                        {/* Search input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Rechercher un client..."
                                value={clientSearch}
                                onChange={(e) => setClientSearch(e.target.value)}
                                className="pl-10 h-12"
                            />
                            {clientSearch && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                                    onClick={() => setClientSearch("")}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {/* Client list */}
                        <div className="max-h-48 overflow-y-auto space-y-2 rounded-lg border p-2">
                            {filteredClients.length === 0 ? (
                                <p className="text-center py-4 text-muted-foreground text-sm">
                                    Aucun client trouvé
                                </p>
                            ) : (
                                filteredClients.slice(0, 10).map((client) => (
                                    <button
                                        key={client.id}
                                        type="button"
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${selectedClient === client.id
                                                ? "bg-primary/10 border-2 border-primary"
                                                : "hover:bg-muted border-2 border-transparent"
                                            }`}
                                        onClick={() => {
                                            setSelectedClient(client.id)
                                            setClientSearch("")
                                        }}
                                    >
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {client.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{client.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {client.phone || client.email || "Pas de contact"}
                                            </p>
                                        </div>
                                        {selectedClient === client.id && (
                                            <Check className="h-5 w-5 text-primary shrink-0" />
                                        )}
                                    </button>
                                ))
                            )}
                            {filteredClients.length > 10 && (
                                <p className="text-center text-xs text-muted-foreground py-2">
                                    +{filteredClients.length - 10} autres clients...
                                </p>
                            )}
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
                                    className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all ${selectedCoach === coach.id
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

                    {/* 5. SERVICE SELECTION */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-base font-semibold">
                            <Euro className="h-4 w-4 text-primary" />
                            Prestation
                        </Label>

                        <div className="grid gap-2">
                            {services.map((service) => (
                                <button
                                    key={service.id}
                                    type="button"
                                    className={`flex items-center justify-between p-4 rounded-xl text-left transition-all ${selectedService === service.id
                                            ? "bg-primary text-primary-foreground shadow-lg"
                                            : "bg-muted/50 hover:bg-muted"
                                        }`}
                                    onClick={() => setSelectedService(service.id)}
                                >
                                    <div>
                                        <p className="font-semibold">{service.name}</p>
                                        <p className={`text-sm ${selectedService === service.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                            {service.durationMin} min
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold">{service.price}€</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* 6. NOTES (Optional) */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-base font-semibold">
                            Notes (optionnel)
                        </Label>
                        <Textarea
                            placeholder="Informations complémentaires..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="min-h-[80px] resize-none"
                        />
                    </div>

                    {/* 7. RECURRENCE (Collapsible) */}
                    <div className="space-y-3">
                        <button
                            type="button"
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowRecurrence(!showRecurrence)}
                        >
                            <Repeat className="h-4 w-4" />
                            {showRecurrence ? "Masquer" : "Ajouter"} une récurrence
                            <ChevronRight className={`h-4 w-4 transition-transform ${showRecurrence ? "rotate-90" : ""}`} />
                        </button>

                        {showRecurrence && (
                            <Card className="p-4 space-y-4 bg-muted/30">
                                <div className="space-y-2">
                                    <Label className="text-sm">Répéter chaque:</Label>
                                    <div className="flex flex-wrap gap-3">
                                        {DAYS_OF_WEEK.map((day) => (
                                            <label key={day.key} className="flex items-center gap-1.5 cursor-pointer min-h-[44px]">
                                                <input
                                                    type="checkbox"
                                                    name={`day_${day.key}`}
                                                    className="h-5 w-5 rounded"
                                                />
                                                <span className="text-sm">{day.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm">Jusqu'au:</Label>
                                    <Input
                                        type="date"
                                        name="recurrenceEndDate"
                                        min={selectedDate}
                                        className="h-12"
                                    />
                                </div>
                                <input type="hidden" name="isRecurring" value="on" />
                            </Card>
                        )}
                    </div>

                    {/* SUMMARY & SUBMIT */}
                    {isFormComplete && (
                        <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                Récapitulatif
                            </h4>
                            <div className="space-y-2 text-sm">
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
                                    <span className="font-medium">{selectedClientObj?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Coach</span>
                                    <span className="font-medium">{selectedCoachObj?.name || selectedCoachObj?.email}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">{selectedServiceObj?.name}</span>
                                    <span className="font-bold text-lg text-primary">{selectedServiceObj?.price}€</span>
                                </div>
                            </div>
                        </Card>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-14 text-lg font-bold gap-2"
                        disabled={isPending || !isFormComplete}
                    >
                        {isPending ? (
                            "Planification..."
                        ) : (
                            <>
                                <CalendarPlus className="h-5 w-5" />
                                Planifier la séance
                            </>
                        )}
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    )
}
