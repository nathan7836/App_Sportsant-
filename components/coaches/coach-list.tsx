'use client'

import { User } from "@prisma/client"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, CheckCircle, Eye, Star } from "lucide-react"
import { useActionState } from "react"
import { deleteCoach } from "@/actions/coach-actions"
import Link from "next/link"

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
                    <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                        {coach.name?.substring(0, 2).toUpperCase() || "CO"}
                    </AvatarFallback>
                </Avatar>
                <div className="pt-14 px-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-xl">{coach.name}</h3>
                            <p className="text-sm text-primary font-medium truncate max-w-[180px]">{coach.email}</p>
                        </div>
                        <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 border-0 gap-1">
                            <Star className="h-3 w-3" /> Coach
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-6 py-4 space-y-4">
                <div className="space-y-2">
                    <div className="text-center border-t border-b border-border/40 py-3">
                        <span className="block text-xs text-muted-foreground uppercase font-bold mb-1">Status</span>
                        <span className="font-bold text-emerald-600 text-sm flex items-center justify-center gap-1">
                            <CheckCircle className="h-4 w-4" /> Actif
                        </span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="justify-between border-t bg-muted/20 p-3 gap-2">
                <Button size="sm" variant="outline" className="flex-1 gap-2" asChild>
                    <Link href={`/coaches/${coach.id}`}>
                        <Eye className="h-4 w-4" /> Voir profil
                    </Link>
                </Button>
                {isAdmin && (
                    <form action={deleteAction} onSubmit={(e) => { if (!confirm("Supprimer ce coach ?")) e.preventDefault() }}>
                        <input type="hidden" name="userId" value={coach.id} />
                        <Button size="sm" variant="destructive" disabled={isPending}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </form>
                )}
            </CardFooter>
        </Card>
    )
}

export function CoachList({ coaches, currentUserRole }: CoachListProps) {
    const isAdmin = currentUserRole === "ADMIN"

    if (coaches.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Aucun coach enregistré</p>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coaches.map(coach => (
                <CoachCard key={coach.id} coach={coach} isAdmin={isAdmin} />
            ))}
        </div>
    )
}
