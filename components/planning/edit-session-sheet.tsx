'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { updateSession, deleteSession } from "@/actions/planning-actions"
import { useActionState, useState, useEffect } from "react"
import type { User } from "@/types/prisma"
import { Trash2 } from "lucide-react"

interface EditSessionSheetProps {
    session: any // Using any for simplicity here to match the prisma include structure, or define specific type
    coaches: User[]
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditSessionSheet({ session, coaches, open, onOpenChange }: EditSessionSheetProps) {
    const [updateState, updateAction, isUpdatePending] = useActionState(updateSession, null)
    const [deleteState, deleteAction, isDeletePending] = useActionState(deleteSession, null)

    // Parse date/time for defaults
    const sessionDate = new Date(session?.date)
    const defaultDate = session ? sessionDate.toISOString().split('T')[0] : ''
    // Format H:MM
    const h = sessionDate.getHours().toString().padStart(2, '0')
    const m = sessionDate.getMinutes().toString().padStart(2, '0')
    const defaultTime = `${h}:${m}`

    useEffect(() => {
        if (updateState?.success || deleteState?.success) {
            onOpenChange(false)
        }
    }, [updateState, deleteState, onOpenChange])

    if (!session) return null

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Modifier la Séance</SheetTitle>
                    <SheetDescription>
                        {session.service.name} avec {session.client.name}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Update Form */}
                    <form action={updateAction} className="space-y-4">
                        <input type="hidden" name="sessionId" value={session.id} />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-date">Date</Label>
                                <Input id="edit-date" name="date" type="date" required defaultValue={defaultDate} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-time">Heure</Label>
                                <Input id="edit-time" name="time" type="time" required defaultValue={defaultTime} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-coachId">Coach</Label>
                            <Select name="coachId" defaultValue={session.coachId}>
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
                            <Label htmlFor="edit-notes">Notes</Label>
                            <Textarea id="edit-notes" name="notes" defaultValue={session.notes || ""} placeholder="Notes..." />
                        </div>

                        {updateState?.error && (
                            <p className="text-sm text-red-500 font-medium">{updateState.error}</p>
                        )}

                        <Button type="submit" className="w-full" disabled={isUpdatePending || isDeletePending}>
                            {isUpdatePending ? "Enregistrement..." : "Enregistrer les modifications"}
                        </Button>
                    </form>

                    <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-destructive mb-2">Zone Danger</h4>
                        <form action={deleteAction}>
                            <input type="hidden" name="sessionId" value={session.id} />
                            <Button variant="destructive" className="w-full" disabled={isDeletePending || isUpdatePending}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                {isDeletePending ? "Suppression..." : "Supprimer la séance"}
                            </Button>
                        </form>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
