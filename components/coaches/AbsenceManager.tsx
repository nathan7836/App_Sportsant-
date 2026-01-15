'use client'

import { useState } from "react"
import { Absence } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog"
import {
    Calendar,
    CalendarOff,
    Check,
    Clock,
    Plus,
    Trash2,
    X,
    Palmtree,
    Stethoscope,
    HelpCircle
} from "lucide-react"
import { createAbsence, deleteAbsence, updateAbsenceStatus } from "@/actions/coach-actions"
import { toast } from "sonner"
import { useActionState } from "react"

interface AbsenceManagerProps {
    coachId: string
    absences: Absence[]
    isAdmin: boolean
    canManage: boolean
}

export function AbsenceManager({ coachId, absences, isAdmin, canManage }: AbsenceManagerProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [createState, createAction, isCreating] = useActionState(createAbsence, null)
    const [deleteState, deleteAction, isDeleting] = useActionState(deleteAbsence, null)
    const [statusState, statusAction, isUpdatingStatus] = useActionState(updateAbsenceStatus, null)

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'CONGE': return <Palmtree className="h-4 w-4" />
            case 'MALADIE': return <Stethoscope className="h-4 w-4" />
            default: return <HelpCircle className="h-4 w-4" />
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'CONGE': return 'Congé'
            case 'MALADIE': return 'Maladie'
            default: return 'Autre'
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <Badge className="bg-emerald-100 text-emerald-700 border-0"><Check className="h-3 w-3 mr-1" /> Approuvé</Badge>
            case 'REJECTED':
                return <Badge className="bg-rose-100 text-rose-700 border-0"><X className="h-3 w-3 mr-1" /> Refusé</Badge>
            default:
                return <Badge className="bg-amber-100 text-amber-700 border-0"><Clock className="h-3 w-3 mr-1" /> En attente</Badge>
        }
    }

    const formatDateRange = (start: Date, end: Date) => {
        const startDate = new Date(start)
        const endDate = new Date(end)
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }

        if (startDate.toDateString() === endDate.toDateString()) {
            return startDate.toLocaleDateString('fr-FR', { ...options, year: 'numeric' })
        }

        return `${startDate.toLocaleDateString('fr-FR', options)} - ${endDate.toLocaleDateString('fr-FR', { ...options, year: 'numeric' })}`
    }

    const getDaysCount = (start: Date, end: Date) => {
        const startDate = new Date(start)
        const endDate = new Date(end)
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
        return diffDays
    }

    async function handleCreate(formData: FormData) {
        formData.append("coachId", coachId)
        const result = await createAbsence(null, formData)

        if (result?.error) {
            toast.error(result.error)
        } else if (result?.success) {
            toast.success(result.message)
            setIsDialogOpen(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarOff className="h-5 w-5 text-primary" />
                            Gestion des Absences
                        </CardTitle>
                        <CardDescription>Congés, maladies et indisponibilités</CardDescription>
                    </div>
                    {canManage && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" /> Déclarer une absence
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Nouvelle Absence</DialogTitle>
                                    <DialogDescription>
                                        Déclarez une période d'indisponibilité
                                    </DialogDescription>
                                </DialogHeader>
                                <form action={handleCreate} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="startDate">Date de début</Label>
                                            <Input
                                                id="startDate"
                                                name="startDate"
                                                type="date"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="endDate">Date de fin</Label>
                                            <Input
                                                id="endDate"
                                                name="endDate"
                                                type="date"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="type">Type d'absence</Label>
                                        <Select name="type" defaultValue="CONGE">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Type d'absence" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CONGE">
                                                    <span className="flex items-center gap-2">
                                                        <Palmtree className="h-4 w-4" /> Congé
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="MALADIE">
                                                    <span className="flex items-center gap-2">
                                                        <Stethoscope className="h-4 w-4" /> Maladie
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="AUTRE">
                                                    <span className="flex items-center gap-2">
                                                        <HelpCircle className="h-4 w-4" /> Autre
                                                    </span>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reason">Motif (optionnel)</Label>
                                        <Textarea
                                            id="reason"
                                            name="reason"
                                            placeholder="Précisez le motif si nécessaire..."
                                            className="min-h-[80px]"
                                        />
                                    </div>

                                    <DialogFooter className="gap-2">
                                        <DialogClose asChild>
                                            <Button type="button" variant="outline">Annuler</Button>
                                        </DialogClose>
                                        <Button type="submit" disabled={isCreating}>
                                            {isCreating ? "Enregistrement..." : "Enregistrer"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {absences.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <CalendarOff className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="font-medium">Aucune absence déclarée</p>
                        <p className="text-sm">Les absences apparaîtront ici</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {absences.map((absence) => (
                            <div
                                key={absence.id}
                                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${absence.type === 'CONGE' ? 'bg-blue-100 text-blue-600' :
                                            absence.type === 'MALADIE' ? 'bg-rose-100 text-rose-600' :
                                                'bg-slate-100 text-slate-600'
                                        }`}>
                                        {getTypeIcon(absence.type)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold">{getTypeLabel(absence.type)}</p>
                                            {getStatusBadge(absence.status)}
                                        </div>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Calendar className="h-3 w-3" />
                                            {formatDateRange(absence.startDate, absence.endDate)}
                                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                                                {getDaysCount(absence.startDate, absence.endDate)} jour(s)
                                            </span>
                                        </p>
                                        {absence.reason && (
                                            <p className="text-sm text-muted-foreground mt-1 italic">
                                                "{absence.reason}"
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Admin approval buttons */}
                                    {isAdmin && absence.status === 'PENDING' && (
                                        <>
                                            <form action={statusAction}>
                                                <input type="hidden" name="absenceId" value={absence.id} />
                                                <input type="hidden" name="status" value="APPROVED" />
                                                <Button
                                                    type="submit"
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                                    disabled={isUpdatingStatus}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            </form>
                                            <form action={statusAction}>
                                                <input type="hidden" name="absenceId" value={absence.id} />
                                                <input type="hidden" name="status" value="REJECTED" />
                                                <Button
                                                    type="submit"
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                                    disabled={isUpdatingStatus}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </>
                                    )}

                                    {/* Delete button */}
                                    {(isAdmin || (canManage && absence.status === 'PENDING')) && (
                                        <form
                                            action={deleteAction}
                                            onSubmit={(e) => {
                                                if (!confirm("Supprimer cette absence ?")) e.preventDefault()
                                            }}
                                        >
                                            <input type="hidden" name="absenceId" value={absence.id} />
                                            <Button
                                                type="submit"
                                                size="sm"
                                                variant="ghost"
                                                className="text-muted-foreground hover:text-destructive"
                                                disabled={isDeleting}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
