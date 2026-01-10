'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil } from "lucide-react"
import { updateMonthlyGoal } from "@/actions/settings-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function GoalDialog({ currentGoal }: { currentGoal: number }) {
    const [open, setOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()

    async function onSubmit(formData: FormData) {
        setIsPending(true)
        const result = await updateMonthlyGoal(formData)
        setIsPending(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Objectif enregistré !")
            setOpen(false)
            router.refresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-2 text-muted-foreground hover:text-primary">
                    <Pencil className="h-3 w-3" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Modifier l'Objectif Mensuel</DialogTitle>
                    <DialogDescription>
                        Définissez le chiffre d'affaires cible pour le mois.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="monthlyGoal" className="text-right">
                                Montant (€)
                            </Label>
                            <Input
                                id="monthlyGoal"
                                name="monthlyGoal"
                                type="number"
                                defaultValue={currentGoal}
                                className="col-span-3"
                                min="0"
                                step="100"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Enregistrement..." : "Sauvegarder"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
