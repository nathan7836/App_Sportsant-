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
import type { Client } from "@/types/prisma"
import { deleteClient } from "@/actions/client-actions"
import { useActionState } from "react"
import { NewClientSheet } from "@/components/clients/new-client-sheet"
import { Trash2 } from "lucide-react"
import { ClientMeasurements } from "@/components/clients/client-measurements"

interface ClientListProps {
    clients: Client[]
    currentUserRole?: string
}

export function ClientList({ clients, currentUserRole }: ClientListProps) {
    const isAdmin = currentUserRole === "ADMIN"
    const [state, deleteAction, isPending] = useActionState(deleteClient, null)
    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    <TableHead>Identité & Info</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
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
                                            <div className="text-xs text-muted-foreground md:hidden">{client.phone}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
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
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" disabled={isPending}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        </SheetTrigger>

                        {/* Detailed Client Sheet (Existing Mock content adapted) */}
                        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                            <SheetHeader className="mb-6">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16 border-4 border-muted">
                                        <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <SheetTitle className="text-2xl font-bold">{client.name}</SheetTitle>
                                        <SheetDescription>Fiche client</SheetDescription>
                                    </div>
                                </div>
                            </SheetHeader>

                            <Tabs defaultValue="infos" className="w-full">
                                <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1 rounded-xl">
                                    <TabsTrigger value="infos" className="rounded-lg">Infos</TabsTrigger>
                                    <TabsTrigger value="health" className="rounded-lg">Santé</TabsTrigger>
                                    <TabsTrigger value="tracking" className="rounded-lg">Suivi</TabsTrigger>
                                </TabsList>

                                {/* 1. Basic Info */}
                                <TabsContent value="infos" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Téléphone</Label>
                                            <Input id="phone" value={client.phone || ""} readOnly className="bg-muted/50 border-0" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="birth">Date de naissance</Label>
                                            <Input id="birth" value={client.birthDate ? new Date(client.birthDate).toLocaleDateString() : ""} readOnly className="bg-muted/50 border-0" />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" value={client.email || ""} readOnly className="bg-muted/50 border-0" />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label htmlFor="address">Adresse Domicile</Label>
                                            <Input id="address" value={client.address || ""} readOnly className="bg-muted/50 border-0" />
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* 2. Health & Safety */}
                                <TabsContent value="health" className="space-y-5">
                                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 space-y-3">
                                        <h4 className="font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" /> Urgence
                                        </h4>
                                        <div className="space-y-2">
                                            <Label className="text-rose-700/80">Personne à prévenir</Label>
                                            <Input value={client.emergencyContact || ""} readOnly className="bg-white/50 dark:bg-black/20 border-rose-200" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Métriques</Label>
                                        <div className="flex flex-col gap-4">
                                            <div className="p-3 bg-muted/30 rounded-lg w-full text-center border">
                                                <span className="block text-xs text-muted-foreground uppercase font-bold">Taille</span>
                                                <span className="font-mono text-lg font-bold">{client.height || "-"} cm</span>
                                            </div>
                                            <ClientMeasurements clientId={client.id} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Pathologies / Antécédents</Label>
                                        <Textarea
                                            className="min-h-[100px] bg-muted/30 resize-none font-medium"
                                            defaultValue={client.pathology || ""}
                                            readOnly
                                        />
                                    </div>
                                </TabsContent>

                                {/* 3. Tracking & Goals */}
                                <TabsContent value="tracking" className="space-y-4">
                                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3">
                                        <h4 className="font-semibold text-primary flex items-center gap-2">
                                            <Target className="h-4 w-4" /> Objectif Principal
                                        </h4>
                                        <Input value={client.goals || ""} readOnly className="bg-white/50 dark:bg-black/20 font-bold text-lg" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Remarques</Label>
                                        <Textarea
                                            className="min-h-[150px] bg-amber-50/50 dark:bg-amber-900/10 border-amber-200/50"
                                            defaultValue={client.notes || ""}
                                            readOnly
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="mt-8 flex gap-3">
                                <Button className="w-full bg-primary text-primary-foreground shadow-lg">Enregistrer</Button>
                                <Button variant="outline" className="w-full">Historique Séances</Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                ))}
            </TableBody>
        </Table >
    )
}
