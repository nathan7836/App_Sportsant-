'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Phone, MapPin, Target, AlertCircle, MoreHorizontal } from "lucide-react"
import { Client } from "@prisma/client"
import { deleteClient } from "@/actions/client-actions"
import { useActionState } from "react"
import { NewClientSheet } from "@/components/clients/new-client-sheet"
import { Trash2 } from "lucide-react"
import { ClientMeasurements } from "@/components/clients/client-measurements"
import { ClientDetailSheet } from "@/components/clients/client-detail-sheet"

interface ClientListProps {
    clients: Client[]
    currentUserRole?: string
}

export function ClientList({ clients, currentUserRole }: ClientListProps) {
    const isAdmin = currentUserRole === "ADMIN"
    const [, deleteAction, isPending] = useActionState(deleteClient, null)

    // Mobile Card View
    const MobileClientCard = ({ client }: { client: Client }) => (
        <Sheet>
            <SheetTrigger asChild>
                <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]">
                    <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                        <AvatarFallback className="text-sm font-bold">{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-foreground truncate">{client.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{client.phone || client.email || "Pas de contact"}</div>
                        {client.goals && (
                            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
                                <Target className="h-3 w-3" />
                                <span className="truncate">{client.goals.substring(0, 25)}...</span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200 text-xs">Actif</Badge>
                        {isAdmin && (
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <NewClientSheet client={client} />
                                <form action={deleteAction} onSubmit={(e) => { if (!confirm('Supprimer ce client ?')) e.preventDefault() }}>
                                    <input type="hidden" name="clientId" value={client.id} />
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" disabled={isPending}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </SheetTrigger>
            <ClientDetailSheet client={client} isAdmin={isAdmin} />
        </Sheet>
    )

    return (
        <>
            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-3">
                {clients.map((client) => (
                    <MobileClientCard key={client.id} client={client} />
                ))}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Identité & Info</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead className="hidden lg:table-cell">Santé & Objectif</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.map((client) => (
                            <Sheet key={client.id}>
                                <SheetTrigger asChild>
                                    <TableRow className="group cursor-pointer hover:bg-muted/50 transition-colors">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="border-2 border-background shadow-sm">
                                                    <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-bold text-foreground">{client.name}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-3 w-3 text-primary" /> {client.phone || "-"}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-3 w-3 text-primary" /> {client.address || "-"}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            <div className="flex flex-col gap-1">
                                                {client.goals && (
                                                    <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 w-fit px-2 py-0.5 rounded-full">
                                                        <Target className="h-3 w-3" /> {client.goals.substring(0, 20)}...
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Actif</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {isAdmin && (
                                                <div className="flex items-center justify-end gap-1">
                                                    <NewClientSheet client={client} />
                                                    <form action={deleteAction} onSubmit={(e) => { if (!confirm('Supprimer ce client ?')) e.preventDefault() }}>
                                                        <input type="hidden" name="clientId" value={client.id} />
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" disabled={isPending}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </form>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                </SheetTrigger>
                                <ClientDetailSheet client={client} isAdmin={isAdmin} />
                            </Sheet>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    )
}

