'use client'

import type { User } from "@/types/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, CheckCircle, Mail } from "lucide-react"
import { useActionState } from "react"
import { deleteCoach } from "@/actions/coach-actions"

interface CoachListProps {
    coaches: User[]
    currentUserRole?: string
}

function CoachCard({ coach, isAdmin }: { coach: User, isAdmin: boolean }) {
    const [state, deleteAction, isPending] = useActionState(deleteCoach, null)

    return (
        <Card className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/60 group">
            <div className="h-24 bg-gradient-to-r from-primary via-purple-500 to-indigo-500 opacity-90"></div>
            <CardHeader className="relative pt-0 pb-2">
                <Avatar className="h-24 w-24 absolute -top-12 left-6 border-4 border-background shadow-md">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${coach.email}`} />
                    <AvatarFallback>{coach.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="pt-14 px-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-xl">{coach.name}</h3>
                            <p className="text-sm text-primary font-medium">{coach.email}</p>
                        </div>
                        <div className="flex items-center bg-amber-100 dark:bg-amber-900/30 text-amber-600 px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                            COACH
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-6 py-4 space-y-4">
                <div className="space-y-2">
                    <div className="text-center border-t border-b border-border/40 py-2">
                        <span className="block text-xs text-muted-foreground uppercase font-bold">Status</span>
                        <span className="font-bold text-emerald-600 text-xs flex items-center justify-center gap-1 mt-1">
                            <CheckCircle className="h-3 w-3" /> Actif
                        </span>
                    </div>
                </div>
            </CardContent>
            {isAdmin && (
                <CardFooter className="justify-end border-t bg-muted/20 p-2">
                    <form action={deleteAction} onSubmit={(e) => { if (!confirm("Supprimer ce coach ?")) e.preventDefault() }}>
                        <input type="hidden" name="userId" value={coach.id} />
                        <Button size="sm" variant="destructive" disabled={isPending}>
                            <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                        </Button>
                    </form>
                </CardFooter>
            )}
        </Card>
    )
}

export function CoachList({ coaches, currentUserRole }: CoachListProps) {
    const isAdmin = currentUserRole === "ADMIN"

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coaches.map(coach => (
                <CoachCard key={coach.id} coach={coach} isAdmin={isAdmin} />
            ))}
        </div>
    )
}
