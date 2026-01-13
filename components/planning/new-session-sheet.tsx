'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { createSession } from "@/actions/planning-actions"
import { useActionState, useState, useEffect } from "react"
import type { Client, User, Service } from "@/types/prisma"

interface NewSessionSheetProps {
    clients: Client[]
    coaches: User[]
    services: Service[]
}

export function NewSessionSheet({ clients, coaches, services }: NewSessionSheetProps) {
    const [open, setOpen] = useState(false)
    const [state, formAction, isPending] = useActionState(createSession, null)

    // Default today's date
    const today = new Date().toISOString().split('T')[0]

    useEffect(() => {
        if (state?.success) {
            setOpen(false)
        }
    }, [state])

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button className="bg-primary text-primary-foreground shadow-lg font-bold">
                    <Plus className="mr-2 h-4 w-4" /> Séance
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Nouvelle Séance</SheetTitle>
                    <SheetDescription>
                        Planifier une session de coaching.
                    </SheetDescription>
                </SheetHeader>
                <form action={formAction} className="space-y-4 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date (JJ/MM/AAAA)</Label>
                            <Input id="date" name="date" type="text" placeholder="ex: 25/01/2026" required defaultValue={new Date().toLocaleDateString('fr-FR')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time">Heure (HH:MM)</Label>
                            <Input id="time" name="time" type="text" placeholder="ex: 14:30" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="coachId">Coach</Label>
                        <Select name="coachId" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selectionner un coach" />
                            </SelectTrigger>
                            <SelectContent>
                                {coaches.map(coach => (
                                    <SelectItem key={coach.id} value={coach.id}>
                                        {coach.name || coach.email}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="clientId">Client</Label>
                        <Select name="clientId" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selectionner un client" />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map(client => (
                                    <SelectItem key={client.id} value={client.id}>
                                        {client.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="serviceId">Service</Label>
                        <Select name="serviceId" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Type de séance" />
                            </SelectTrigger>
                            <SelectContent>
                                {services.map(service => (
                                    <SelectItem key={service.id} value={service.id}>
                                        {service.name} ({(service.durationMin)} min) - {service.price}€
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Recurrence Section */}
                    <div className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-center gap-2 mb-2">
                            <input type="checkbox" id="isRecurring" name="isRecurring" className="h-4 w-4" onChange={(e) => {
                                const el = document.getElementById('recurrence-options');
                                if (el) el.style.display = e.target.checked ? 'block' : 'none';
                            }} />
                            <Label htmlFor="isRecurring" className="cursor-pointer font-bold">Répéter (Récurrent)</Label>
                        </div>

                        <div id="recurrence-options" className="hidden space-y-3 mt-3">
                            <div className="space-y-2">
                                <Label>Jours de rdv :</Label>
                                <div className="flex flex-wrap gap-2 text-sm">
                                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d, i) => {
                                        // JS getDay: Sun=0, Mon=1...Sat=6. 
                                        // Array: Mon(1), Tue(2)... Sun(0) mapping needs care.
                                        // Let's use English names mapping to the Server Action keys
                                        // 0=Lun -> Monday (index 1 in Date.getDay)
                                        // 1=Mar -> Tuesday (2)
                                        // ...
                                        // 6=Dim -> Sunday (0)
                                        const names = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                                        return (
                                            <div key={names[i]} className="flex items-center space-x-1">
                                                <input type="checkbox" name={`day_${names[i]}`} id={`d_${names[i]}`} />
                                                <label htmlFor={`d_${names[i]}`}>{d}</label>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="recurrenceEndDate">Jusqu'au (Date de fin)</Label>
                                <Input id="recurrenceEndDate" name="recurrenceEndDate" type="text" placeholder="JJ/MM/AAAA" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" name="notes" placeholder="Détails spécifiques..." />
                    </div>

                    {state?.error && (
                        <p className="text-sm text-red-500 font-medium">{state.error}</p>
                    )}
                    {state?.message && (
                        <p className="text-sm text-green-600 font-medium">{state.message}</p>
                    )}

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Planification..." : "Planifier"}
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    )
}
