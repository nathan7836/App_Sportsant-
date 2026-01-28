'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetBody,
    SheetFooter,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Plus, Pencil, User, Phone, Mail, MapPin, Calendar, Ruler, AlertCircle, Target, FileText, Loader2 } from "lucide-react"
import { createClient, updateClient } from "@/actions/client-actions"
import { useState } from "react"
import { toast } from "sonner"
import type { Client } from "@prisma/client"

interface NewClientSheetProps {
    client?: Client
}

export function NewClientSheet({ client }: NewClientSheetProps) {
    const [open, setOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)

    async function onSubmit(formData: FormData) {
        setIsPending(true)
        let result

        if (client) {
            formData.append("id", client.id)
            result = await updateClient(null, formData)
        } else {
            result = await createClient(null, formData)
        }

        setIsPending(false)

        if (result && result.error) {
            toast.error(result.error)
        } else if (result?.success) {
            toast.success(client ? "Client modifié !" : "Client créé !")
            setOpen(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {client ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Pencil className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Nouveau Client</span>
                        <span className="sm:hidden">Client</span>
                    </Button>
                )}
            </SheetTrigger>

            <SheetContent>
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        {client ? "Modifier le client" : "Nouveau Client"}
                    </SheetTitle>
                    <SheetDescription>
                        {client ? "Modifiez les informations du client." : "Créez un nouveau dossier client."}
                    </SheetDescription>
                </SheetHeader>

                <SheetBody>
                    <form action={onSubmit} id="client-form" className="space-y-4">
                        {/* Nom complet */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                Nom complet <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={client?.name}
                                    required
                                    placeholder="Jean Dupont"
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                                    Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        defaultValue={client?.email || ""}
                                        placeholder="mail@exemple.com"
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">
                                    Téléphone
                                </Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        defaultValue={client?.phone || ""}
                                        placeholder="06 12 34 56 78"
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Adresse */}
                        <div className="space-y-1.5">
                            <Label htmlFor="address" className="text-xs font-medium text-muted-foreground">
                                Adresse
                            </Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                <Input
                                    id="address"
                                    name="address"
                                    defaultValue={client?.address || ""}
                                    placeholder="Rue, Ville..."
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        {/* Date de naissance & Taille */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="birthDate" className="text-xs font-medium text-muted-foreground">
                                    Date de naissance
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                    <Input
                                        id="birthDate"
                                        name="birthDate"
                                        type="date"
                                        defaultValue={client?.birthDate ? new Date(client.birthDate).toISOString().split('T')[0] : ""}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="height" className="text-xs font-medium text-muted-foreground">
                                    Taille (cm)
                                </Label>
                                <div className="relative">
                                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                    <Input
                                        id="height"
                                        name="height"
                                        type="number"
                                        defaultValue={client?.height || ""}
                                        placeholder="175"
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pathologies */}
                        <div className="space-y-1.5">
                            <Label htmlFor="pathology" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                                Pathologies / Blessures
                            </Label>
                            <Textarea
                                id="pathology"
                                name="pathology"
                                defaultValue={client?.pathology || ""}
                                placeholder="Douleurs, historiques médicaux..."
                                className="min-h-[70px] resize-none"
                            />
                        </div>

                        {/* Objectifs */}
                        <div className="space-y-1.5">
                            <Label htmlFor="goals" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                <Target className="h-3.5 w-3.5 text-primary" />
                                Objectifs
                            </Label>
                            <Textarea
                                id="goals"
                                name="goals"
                                defaultValue={client?.goals || ""}
                                placeholder="Perte de poids, prise de masse..."
                                className="min-h-[70px] resize-none"
                            />
                        </div>

                        {/* Contact d'urgence */}
                        <div className="space-y-1.5">
                            <Label htmlFor="emergencyContact" className="text-xs font-medium text-muted-foreground">
                                Contact d'urgence
                            </Label>
                            <Input
                                id="emergencyContact"
                                name="emergencyContact"
                                defaultValue={client?.emergencyContact || ""}
                                placeholder="Nom et numéro"
                            />
                        </div>

                        {/* Notes privées */}
                        <div className="space-y-1.5">
                            <Label htmlFor="notes" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5" />
                                Notes privées
                            </Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                defaultValue={client?.notes || ""}
                                placeholder="Notes invisibles pour le client..."
                                className="min-h-[70px] resize-none bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/30"
                            />
                        </div>
                    </form>
                </SheetBody>

                <SheetFooter className="flex-row gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-11"
                        onClick={() => setOpen(false)}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        form="client-form"
                        className="flex-1 h-11 gap-2"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="h-4 w-4" />
                        )}
                        {client ? "Enregistrer" : "Créer"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
