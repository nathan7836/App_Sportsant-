'use client'

import { Service } from "@prisma/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Clock, Trash2, Edit } from "lucide-react"
import { ServiceSheet } from "./service-sheet"
import { deleteService } from "@/actions/service-actions"
import { useActionState, useState } from "react"

function ServiceCard({ service }: { service: Service }) {
    const [open, setOpen] = useState(false)
    const [deleteState, deleteAction, isDeletePending] = useActionState(deleteService, null)

    return (
        <>
            <Card className="flex flex-col shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl">{service.name}</CardTitle>
                            <CardDescription className="line-clamp-1">{service.description || "Aucune description"}</CardDescription>
                        </div>
                        <Badge variant="secondary" className="font-mono">{service.durationMin} min</Badge>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                    <div className="flex items-baseline">
                        <span className="text-3xl font-bold">{service.price}€</span>
                        <span className="text-muted-foreground ml-2">/ séance</span>
                    </div>
                    {/* Mock features for now, could be JSON in DB later */}
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex gap-2 items-center"><Check className="h-4 w-4 text-emerald-500" /> Séances planifiables</li>
                        <li className="flex gap-2 items-center"><Clock className="h-4 w-4 text-primary" /> {service.durationMin} minutes</li>
                    </ul>
                </CardContent>
                <CardFooter className="gap-2 pt-2">
                    <Button variant="outline" className="flex-1" onClick={() => setOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" /> Modifier
                    </Button>
                    <form action={deleteAction}>
                        <input type="hidden" name="serviceId" value={service.id} />
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" disabled={isDeletePending}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </form>
                </CardFooter>

                {deleteState?.error && (
                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center p-4 text-center text-destructive text-sm font-medium animate-in fade-in">
                        {deleteState.error}
                    </div>
                )}
            </Card>

            <ServiceSheet service={service} open={open} onOpenChange={setOpen} />
        </>
    )
}

export function ServiceList({ services }: { services: Service[] }) {
    if (services.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/50">
                <h3 className="text-lg font-medium text-muted-foreground">Aucun service</h3>
                <p className="text-sm text-muted-foreground mb-4">Commencez par ajouter votre première prestation.</p>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map(service => (
                <ServiceCard key={service.id} service={service} />
            ))}
        </div>
    )
}
