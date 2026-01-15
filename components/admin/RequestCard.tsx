'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    CalendarX,
    CalendarClock,
    User,
    Calendar,
    Clock,
    Check,
    X,
    MessageSquare,
    ArrowRight
} from "lucide-react"
import { respondToSessionChangeRequest } from "@/actions/session-request-actions"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"

interface RequestCardProps {
    request: {
        id: string
        type: string
        reason: string
        newDate: Date | null
        createdAt: Date
        session: {
            id: string
            date: Date
            client: { name: string }
            service: { name: string; price: number; durationMin: number }
            coach: { name: string | null; email: string }
        }
    }
}

export function RequestCard({ request }: RequestCardProps) {
    const [state, formAction, isPending] = useActionState(respondToSessionChangeRequest, null)
    const [response, setResponse] = useState("")
    const [showResponseField, setShowResponseField] = useState(false)

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message)
        }
        if (state?.error) {
            toast.error(state.error)
        }
    }, [state])

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatTimeAgo = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - new Date(date).getTime()
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (hours < 1) return "Il y a moins d'1h"
        if (hours < 24) return `Il y a ${hours}h`
        if (days < 7) return `Il y a ${days} jour(s)`
        return new Date(date).toLocaleDateString('fr-FR')
    }

    const isCancel = request.type === 'CANCEL'

    return (
        <Card className={`overflow-hidden border-l-4 ${isCancel ? 'border-l-rose-500' : 'border-l-blue-500'}`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isCancel ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                            {isCancel ? <CalendarX className="h-5 w-5" /> : <CalendarClock className="h-5 w-5" />}
                        </div>
                        <div>
                            <CardTitle className="text-lg">
                                Demande {isCancel ? "d'annulation" : "de report"}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {formatTimeAgo(request.createdAt)}
                            </p>
                        </div>
                    </div>
                    <Badge className={isCancel ? 'bg-rose-100 text-rose-700 border-0' : 'bg-blue-100 text-blue-700 border-0'}>
                        {isCancel ? 'Annulation' : 'Report'}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Coach & Session Info */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Coach:</span>
                            <span className="font-medium">{request.session.coach.name || request.session.coach.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Client:</span>
                            <span className="font-medium">{request.session.client.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Prestation:</span>
                            <span className="font-medium">{request.session.service.name}</span>
                            <span className="text-primary font-bold">({request.session.service.price}€)</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-start gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                                <span className="text-muted-foreground">Date actuelle:</span>
                                <p className="font-medium capitalize">{formatDate(request.session.date)}</p>
                            </div>
                        </div>

                        {request.type === 'RESCHEDULE' && request.newDate && (
                            <div className="flex items-start gap-2 text-sm">
                                <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5" />
                                <div>
                                    <span className="text-blue-600 font-medium">Nouvelle date proposée:</span>
                                    <p className="font-semibold text-blue-700 capitalize">{formatDate(request.newDate)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reason */}
                <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                        <MessageSquare className="h-4 w-4" />
                        Motif de la demande
                    </div>
                    <p className="text-sm text-muted-foreground italic">"{request.reason}"</p>
                </div>

                {/* Response Field */}
                {showResponseField && (
                    <div className="space-y-2">
                        <Label>Réponse (optionnel)</Label>
                        <Textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder="Ajoutez un commentaire pour le coach..."
                            className="resize-none"
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    {!showResponseField ? (
                        <Button
                            variant="outline"
                            className="flex-1 sm:flex-none"
                            onClick={() => setShowResponseField(true)}
                        >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Ajouter une réponse
                        </Button>
                    ) : null}

                    <div className="flex gap-2 flex-1 sm:justify-end">
                        <form action={formAction} className="flex-1 sm:flex-none">
                            <input type="hidden" name="requestId" value={request.id} />
                            <input type="hidden" name="action" value="REJECT" />
                            <input type="hidden" name="adminResponse" value={response} />
                            <Button
                                type="submit"
                                variant="outline"
                                className="w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-200"
                                disabled={isPending}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Refuser
                            </Button>
                        </form>

                        <form action={formAction} className="flex-1 sm:flex-none">
                            <input type="hidden" name="requestId" value={request.id} />
                            <input type="hidden" name="action" value="APPROVE" />
                            <input type="hidden" name="adminResponse" value={response} />
                            <Button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-700"
                                disabled={isPending}
                            >
                                <Check className="h-4 w-4 mr-2" />
                                Accepter
                            </Button>
                        </form>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
