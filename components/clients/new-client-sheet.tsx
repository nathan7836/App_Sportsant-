'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Plus, Pencil } from "lucide-react"
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
            // Update mode
            formData.append("id", client.id)
            result = await updateClient(null, formData)
        } else {
            // Create mode
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
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Nouveau Client
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="overflow-y-auto w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{client ? "Modifier le client" : "Nouveau Client"}</SheetTitle>
                    <SheetDescription>
                        {client ? "Modifiez les informations du client." : "Remplissez les informations pour créer un dossier client."}
                    </SheetDescription>
                </SheetHeader>
                <form action={onSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nom complet *</Label>
                        <Input id="name" name="name" defaultValue={client?.name} required placeholder="Ex: Jean Dupont" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" defaultValue={client?.email || ""} placeholder="mail@exemple.com" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Téléphone</Label>
                            <Input id="phone" name="phone" type="tel" defaultValue={client?.phone || ""} placeholder="06..." />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="address">Adresse</Label>
                        <Input id="address" name="address" defaultValue={client?.address || ""} placeholder="Rue, Ville..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="birthDate">Date Naissance</Label>
                            <Input
                                id="birthDate"
                                name="birthDate"
                                type="date"
                                defaultValue={client?.birthDate ? new Date(client.birthDate).toISOString().split('T')[0] : ""}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="height">Taille (cm)</Label>
                            <Input id="height" name="height" type="number" defaultValue={client?.height || ""} placeholder="175" />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="pathology">Pathologies / Blessures</Label>
                        <Textarea id="pathology" name="pathology" defaultValue={client?.pathology || ""} placeholder="Douleurs, historiques..." className="min-h-[60px]" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="goals">Objectifs</Label>
                        <Textarea id="goals" name="goals" defaultValue={client?.goals || ""} placeholder="Perte de poids, prise de masse..." className="min-h-[60px]" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="emergencyContact">Contact d'Urgence</Label>
                        <Input id="emergencyContact" name="emergencyContact" defaultValue={client?.emergencyContact || ""} placeholder="Nom et numéro" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes privées</Label>
                        <Textarea id="notes" name="notes" defaultValue={client?.notes || ""} className="min-h-[80px]" placeholder="Notes invisibles pour le client..." />
                    </div>
                    <SheetFooter className="mt-4">
                        <SheetClose asChild>
                            <Button variant="outline" type="button">Annuler</Button>
                        </SheetClose>
                        <Button type="submit" disabled={isPending}>{isPending ? "Enregistrement..." : "Sauvegarder"}</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}
