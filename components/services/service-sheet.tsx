'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetBody, SheetFooter, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { createService, updateService } from "@/actions/service-actions"
import { useActionState, useState, useEffect } from "react"
import { Plus, Loader2, Euro, Clock, FileText } from "lucide-react"
import { Service } from "@prisma/client"

interface ServiceSheetProps {
    service?: Service
    trigger?: React.ReactNode
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
                        <Button className="gap-2 shadow-lg">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Nouveau</span> Service
                        </Button>
                    </SheetTrigger>
                )
            )}

            <SheetContent>
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Euro className="h-5 w-5 text-primary" />
                        {service ? "Modifier le Service" : "Nouveau Service"}
                    </SheetTitle>
                    <SheetDescription>
                        {service ? "Modifiez les détails de la prestation." : "Ajoutez une nouvelle prestation."}
                    </SheetDescription>
                </SheetHeader>

                <SheetBody>
                    <form action={formAction} id="service-form" className="space-y-4">
                        {service && <input type="hidden" name="serviceId" value={service.id} />}

                        {/* Nom */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                Nom du service <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                required
                                placeholder="Ex: Coaching Individuel"
                                defaultValue={service?.name}
                            />
                        </div>

                        {/* Prix & Durée */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="price" className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                    <Euro className="h-3.5 w-3.5" />
                                    Prix <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        placeholder="60"
                                        defaultValue={service?.price}
                                        className="pr-8"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="durationMin" className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    Durée <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="durationMin"
                                        name="durationMin"
                                        type="number"
                                        min="15"
                                        step="5"
                                        required
                                        placeholder="60"
                                        defaultValue={service?.durationMin || 60}
                                        className="pr-12"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">min</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label htmlFor="description" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5" />
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Détails, avantages..."
                                className="min-h-[100px] resize-none"
                                defaultValue={service?.description || ""}
                            />
                        </div>

                        {state?.error && (
                            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                                {state.error}
                            </div>
                        )}
                    </form>
                </SheetBody>

                <SheetFooter className="flex-row gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-11"
                        onClick={() => setOpen?.(false)}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        form="service-form"
                        className="flex-1 h-11 gap-2"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="h-4 w-4" />
                        )}
                        {service ? "Enregistrer" : "Créer"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
