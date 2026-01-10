'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { createService, updateService } from "@/actions/service-actions"
import { useActionState, useState, useEffect } from "react"
import { Plus, Loader2 } from "lucide-react"
import { Service } from "@prisma/client"

interface ServiceSheetProps {
    service?: Service // If present, Edit mode. If null, Create mode.
    trigger?: React.ReactNode // Custom trigger button
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function ServiceSheet({ service, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: ServiceSheetProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = isControlled ? setControlledOpen : setInternalOpen

    const action = service ? updateService : createService
    const [state, formAction, isPending] = useActionState(action, null)

    useEffect(() => {
        if (state?.success) {
            setOpen?.(false)
        }
    }, [state, setOpen])

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            {trigger ? (
                <SheetTrigger asChild>
                    {trigger}
                </SheetTrigger>
            ) : (
                !service && (
                    <SheetTrigger asChild>
                        <Button className="bg-primary text-primary-foreground shadow-lg font-bold">
                            <Plus className="mr-2 h-4 w-4" /> Nouveau Service
                        </Button>
                    </SheetTrigger>
                )
            )}

            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{service ? "Modifier le Service" : "Nouveau Service"}</SheetTitle>
                    <SheetDescription>
                        {service ? "Modifiez les détails de la prestation." : "Ajoutez une nouvelle prestation à votre catalogue."}
                    </SheetDescription>
                </SheetHeader>

                <form action={formAction} className="space-y-4 mt-6">
                    {service && <input type="hidden" name="serviceId" value={service.id} />}

                    <div className="space-y-2">
                        <Label htmlFor="name">Nom du service</Label>
                        <Input id="name" name="name" required placeholder="Ex: Coaching Individuel" defaultValue={service?.name} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Prix (€)</Label>
                            <Input id="price" name="price" type="number" min="0" step="0.01" required placeholder="60" defaultValue={service?.price} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="durationMin">Durée (min)</Label>
                            <Input id="durationMin" name="durationMin" type="number" min="15" step="5" required placeholder="60" defaultValue={service?.durationMin || 60} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="Détails, avantages..." className="h-24" defaultValue={service?.description || ""} />
                    </div>

                    {state?.error && (
                        <div className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-200">
                            {state.error}
                        </div>
                    )}

                    <SheetFooter className="pt-4">
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {service ? "Enregistrer" : "Créer le service"}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}
