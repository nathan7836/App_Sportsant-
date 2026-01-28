"use client"

import { useState } from "react"
import { Client } from "@prisma/client"
import { updateClient } from "@/actions/client-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SheetContent, SheetHeader, SheetBody, SheetFooter, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Target, Edit, Save, X, FileDown, Phone, Mail, MapPin, Loader2, User, Heart, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { ClientMeasurements } from "@/components/clients/client-measurements"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { getMeasurements } from "@/actions/measurement-actions"

interface ClientDetailSheetProps {
    client: Client
    isAdmin?: boolean
}

export function ClientDetailSheet({ client, isAdmin = false }: ClientDetailSheetProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [isExporting, setIsExporting] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsPending(true)
        formData.append("id", client.id)

        const result = await updateClient(null, formData)
        setIsPending(false)

        if (result?.error) {
            toast.error(result.error)
        } else if (result?.success) {
            toast.success("Client mis à jour")
            setIsEditing(false)
        }
    }

    async function handleExportPDF() {
        try {
            setIsExporting(true)
            const measurements = await getMeasurements(client.id)

            const doc = new jsPDF()

            // Header
            doc.setFontSize(20)
            doc.text(`Fiche Client: ${client.name}`, 14, 20)

            doc.setFontSize(10)
            doc.setTextColor(100)
            doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 28)

            // Info basiques
            doc.setFontSize(12)
            doc.setTextColor(0)
            doc.text("Informations Personnelles", 14, 40)

            const infoData = [
                ["Email", client.email || "-"],
                ["Téléphone", client.phone || "-"],
                ["Adresse", client.address || "-"],
                ["Date de naissance", client.birthDate ? new Date(client.birthDate).toLocaleDateString('fr-FR') : "-"],
                ["Taille", client.height ? `${client.height} cm` : "-"],
                ["Pathologies", client.pathology || "Aucune"],
                ["Contact Urgence", client.emergencyContact || "-"]
            ]

            autoTable(doc, {
                startY: 45,
                head: [],
                body: infoData,
                theme: 'plain',
                styles: { fontSize: 10, cellPadding: 2 },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
            })

            // Objectifs et Notes
            let currentY = (doc as any).lastAutoTable.finalY + 15

            doc.setFontSize(12)
            doc.text("Objectifs", 14, currentY)
            doc.setFontSize(10)
            doc.text(client.goals || "Non défini", 14, currentY + 6, { maxWidth: 180 })

            currentY += 20

            if (measurements && measurements.length > 0) {
                doc.setFontSize(12)
                doc.text("Historique des Mesures", 14, currentY)

                const measurementRows = measurements.map(m => [
                    new Date(m.date).toLocaleDateString('fr-FR'),
                    m.weight ? `${m.weight} kg` : '-',
                    m.fatMass ? `${m.fatMass} %` : '-',
                    m.muscleMass ? `${m.muscleMass} %` : '-'
                ])

                autoTable(doc, {
                    startY: currentY + 5,
                    head: [['Date', 'Poids', 'Masse Grasse', 'Masse Musculaire']],
                    body: measurementRows,
                    theme: 'grid',
                    headStyles: { fillColor: [41, 128, 185] }
                })
            }

            doc.save(`client_${client.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
            toast.success("PDF téléchargé avec succès")
        } catch (error) {
            console.error(error)
            toast.error("Erreur lors de la génération du PDF")
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <SheetContent>
            {/* Header avec Avatar */}
            <SheetHeader className="!pb-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-sm">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {client.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <SheetTitle className="truncate">{client.name}</SheetTitle>
                        <SheetDescription className="truncate">
                            {client.phone || client.email || "Fiche client"}
                        </SheetDescription>
                    </div>
                </div>
            </SheetHeader>

            {/* Body - Scrollable */}
            <SheetBody>
                <form action={handleSubmit} id="client-form">
                    <Tabs defaultValue="infos" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-4 h-11 p-1 bg-muted/50 rounded-xl">
                            <TabsTrigger value="infos" className="rounded-lg text-xs gap-1.5 data-[state=active]:shadow-sm">
                                <User className="h-3.5 w-3.5" />
                                <span className="hidden xs:inline">Infos</span>
                            </TabsTrigger>
                            <TabsTrigger value="health" className="rounded-lg text-xs gap-1.5 data-[state=active]:shadow-sm">
                                <Heart className="h-3.5 w-3.5" />
                                <span className="hidden xs:inline">Santé</span>
                            </TabsTrigger>
                            <TabsTrigger value="tracking" className="rounded-lg text-xs gap-1.5 data-[state=active]:shadow-sm">
                                <TrendingUp className="h-3.5 w-3.5" />
                                <span className="hidden xs:inline">Suivi</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab 1: Informations */}
                        <TabsContent value="infos" className="space-y-4 mt-0">
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">
                                        Nom complet
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={client.name}
                                        readOnly={!isEditing}
                                        className={!isEditing ? "bg-muted/30 border-transparent" : ""}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">
                                            Téléphone
                                        </Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                            <Input
                                                id="phone"
                                                name="phone"
                                                defaultValue={client.phone || ""}
                                                readOnly={!isEditing}
                                                className={`pl-9 ${!isEditing ? "bg-muted/30 border-transparent" : ""}`}
                                                placeholder="-"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="birth" className="text-xs font-medium text-muted-foreground">
                                            Naissance
                                        </Label>
                                        <Input
                                            id="birth"
                                            name="birthDate"
                                            type="date"
                                            defaultValue={client.birthDate ? new Date(client.birthDate).toISOString().split('T')[0] : ""}
                                            readOnly={!isEditing}
                                            className={!isEditing ? "bg-muted/30 border-transparent" : ""}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                                        Email
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            defaultValue={client.email || ""}
                                            readOnly={!isEditing}
                                            className={`pl-9 ${!isEditing ? "bg-muted/30 border-transparent" : ""}`}
                                            placeholder="-"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="address" className="text-xs font-medium text-muted-foreground">
                                        Adresse
                                    </Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                        <Input
                                            id="address"
                                            name="address"
                                            defaultValue={client.address || ""}
                                            readOnly={!isEditing}
                                            className={`pl-9 ${!isEditing ? "bg-muted/30 border-transparent" : ""}`}
                                            placeholder="-"
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Tab 2: Santé */}
                        <TabsContent value="health" className="space-y-4 mt-0">
                            {/* Contact d'urgence */}
                            <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="h-4 w-4 text-rose-600" />
                                    <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                                        Contact d'urgence
                                    </span>
                                </div>
                                <Input
                                    name="emergencyContact"
                                    defaultValue={client.emergencyContact || ""}
                                    readOnly={!isEditing}
                                    placeholder="Nom et téléphone"
                                    className={`bg-white/60 dark:bg-black/20 border-rose-200/50 ${!isEditing ? "border-transparent" : ""}`}
                                />
                            </div>

                            {/* Taille */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border">
                                <span className="text-sm font-medium">Taille</span>
                                {isEditing ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            name="height"
                                            type="number"
                                            defaultValue={client.height || ""}
                                            className="w-20 text-center h-9"
                                            placeholder="cm"
                                        />
                                        <span className="text-sm text-muted-foreground">cm</span>
                                    </div>
                                ) : (
                                    <span className="font-mono font-bold text-primary">
                                        {client.height ? `${client.height} cm` : "-"}
                                    </span>
                                )}
                            </div>

                            {/* Pathologies */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground">
                                    Pathologies / Antécédents
                                </Label>
                                <Textarea
                                    name="pathology"
                                    defaultValue={client.pathology || ""}
                                    readOnly={!isEditing}
                                    placeholder="Aucune pathologie connue"
                                    className={`min-h-[80px] resize-none ${!isEditing ? "bg-muted/30 border-transparent" : ""}`}
                                />
                            </div>

                            {/* Mesures */}
                            <div className="pt-2">
                                <ClientMeasurements clientId={client.id} />
                            </div>
                        </TabsContent>

                        {/* Tab 3: Suivi & Objectifs */}
                        <TabsContent value="tracking" className="space-y-4 mt-0">
                            {/* Objectif principal */}
                            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="h-4 w-4 text-primary" />
                                    <span className="text-xs font-semibold text-primary">
                                        Objectif principal
                                    </span>
                                </div>
                                <Input
                                    name="goals"
                                    defaultValue={client.goals || ""}
                                    readOnly={!isEditing}
                                    placeholder="Définir un objectif..."
                                    className={`font-medium ${!isEditing ? "bg-white/50 dark:bg-black/20 border-transparent" : ""}`}
                                />
                            </div>

                            {/* Notes privées */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground">
                                    Notes privées (coach uniquement)
                                </Label>
                                <Textarea
                                    name="notes"
                                    defaultValue={client.notes || ""}
                                    readOnly={!isEditing}
                                    placeholder="Ajouter des notes..."
                                    className={`min-h-[120px] resize-none ${!isEditing ? "bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/30" : ""}`}
                                />
                            </div>

                            {/* Export PDF */}
                            {!isEditing && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-11 gap-2"
                                    onClick={handleExportPDF}
                                    disabled={isExporting}
                                >
                                    {isExporting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <FileDown className="h-4 w-4" />
                                    )}
                                    Exporter en PDF
                                </Button>
                            )}
                        </TabsContent>
                    </Tabs>
                </form>
            </SheetBody>

            {/* Footer avec actions */}
            <SheetFooter>
                {isEditing ? (
                    <div className="flex gap-2 w-full">
                        <Button
                            type="submit"
                            form="client-form"
                            className="flex-1 h-11 gap-2"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Enregistrer
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-11 w-11 p-0"
                            onClick={() => setIsEditing(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    isAdmin && (
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-11 gap-2"
                            onClick={() => setIsEditing(true)}
                        >
                            <Edit className="h-4 w-4" />
                            Modifier la fiche
                        </Button>
                    )
                )}
            </SheetFooter>
        </SheetContent>
    )
}
