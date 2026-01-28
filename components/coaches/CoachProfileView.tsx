'use client'

import { useState } from "react"
import { User, CoachDetails, Absence, Session, Client, Service } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    ArrowLeft,
    Briefcase,
    Calendar,
    CheckCircle,
    Clock,
    Edit,
    Euro,
    FileText,
    GraduationCap,
    Mail,
    Phone,
    Shield,
    Star,
    Upload,
    User as UserIcon,
    XCircle
} from "lucide-react"
import Link from "next/link"
import { updateCoachDetails } from "@/actions/coach-actions"
import { toast } from "sonner"
import { AbsenceManager } from "./AbsenceManager"

type SessionWithRelations = Session & {
    client: Client
    service: Service
}

type CoachWithDetails = User & {
    coachDetails: CoachDetails | null
    absences: Absence[]
    sessions: SessionWithRelations[]
}

interface CoachProfileViewProps {
    coach: CoachWithDetails
    isAdmin: boolean
    isOwnProfile: boolean
}

export function CoachProfileView({ coach, isAdmin, isOwnProfile }: CoachProfileViewProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [isPending, setIsPending] = useState(false)

    const canEdit = isAdmin || isOwnProfile

    async function handleSubmit(formData: FormData) {
        setIsPending(true)
        formData.append("userId", coach.id)

        const result = await updateCoachDetails(null, formData)
        setIsPending(false)

        if (result?.error) {
            toast.error(result.error)
        } else if (result?.success) {
            toast.success("Profil mis à jour")
            setIsEditing(false)
        }
    }

    const details = coach.coachDetails

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/coaches">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            Profil Coach
                        </h2>
                        <p className="text-muted-foreground">Informations et documents administratifs</p>
                    </div>
                </div>
                {canEdit && !isEditing && (
                    <Button onClick={() => setIsEditing(true)} className="gap-2">
                        <Edit className="h-4 w-4" /> Modifier
                    </Button>
                )}
            </div>

            {/* Profile Card */}
            <Card className="overflow-hidden border-border/50">
                <div className="h-32 bg-gradient-to-r from-primary via-purple-500 to-indigo-500 relative">
                    <div className="absolute inset-0 bg-black/10" />
                </div>
                <CardContent className="relative pt-0 pb-6">
                    <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
                        <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                            <AvatarImage src={`https://i.pravatar.cc/150?u=${coach.email}`} />
                            <AvatarFallback className="text-3xl font-bold bg-primary text-primary-foreground">
                                {coach.name?.substring(0, 2).toUpperCase() || "CO"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                                <h3 className="text-2xl font-bold">{coach.name || "Coach"}</h3>
                                <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                                    <Star className="h-3 w-3 mr-1" /> Coach
                                </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Mail className="h-4 w-4" /> {coach.email}
                                </span>
                                {details?.phone && (
                                    <span className="flex items-center gap-1">
                                        <Phone className="h-4 w-4" /> {details.phone}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Euro className="h-4 w-4" /> {details?.hourlyRate || 0}€/h
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <form action={handleSubmit}>
                <Tabs defaultValue="infos" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 h-12 p-1 bg-muted/50 rounded-xl">
                        <TabsTrigger value="infos" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                            <UserIcon className="h-4 w-4" /> Infos
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                            <FileText className="h-4 w-4" /> Documents
                        </TabsTrigger>
                        <TabsTrigger value="absences" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                            <Calendar className="h-4 w-4" /> Absences
                        </TabsTrigger>
                        <TabsTrigger value="seances" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                            <Clock className="h-4 w-4" /> Séances
                        </TabsTrigger>
                    </TabsList>

                    {/* Infos Tab */}
                    <TabsContent value="infos">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-primary" />
                                    Informations Professionnelles
                                </CardTitle>
                                <CardDescription>Compétences et tarification</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="userName">Nom complet</Label>
                                        <Input
                                            id="userName"
                                            name="userName"
                                            defaultValue={coach.name || ""}
                                            disabled={!isEditing}
                                            className="disabled:opacity-70"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Téléphone professionnel</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            defaultValue={details?.phone || ""}
                                            disabled={!isEditing}
                                            placeholder="06 12 34 56 78"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="hourlyRate">Tarif horaire (€)</Label>
                                        <Input
                                            id="hourlyRate"
                                            name="hourlyRate"
                                            type="number"
                                            defaultValue={details?.hourlyRate || 0}
                                            disabled={!isEditing}
                                            min={0}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="specialties">Spécialisations</Label>
                                        <Input
                                            id="specialties"
                                            name="specialties"
                                            defaultValue={details?.specialties || ""}
                                            disabled={!isEditing}
                                            placeholder="Musculation, Cardio, Yoga..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="skills">Compétences</Label>
                                    <Input
                                        id="skills"
                                        name="skills"
                                        defaultValue={details?.skills || ""}
                                        disabled={!isEditing}
                                        placeholder="Nutrition, Réhabilitation, Sport adapté..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Biographie</Label>
                                    <Textarea
                                        id="bio"
                                        name="bio"
                                        defaultValue={details?.bio || ""}
                                        disabled={!isEditing}
                                        placeholder="Présentez-vous en quelques lignes..."
                                        className="min-h-[100px]"
                                    />
                                </div>

                                {isEditing && (
                                    <div className="flex gap-3 pt-4 border-t">
                                        <Button type="submit" disabled={isPending} className="flex-1">
                                            {isPending ? "Enregistrement..." : "Sauvegarder"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsEditing(false)}
                                            className="flex-1"
                                        >
                                            Annuler
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Documents Tab */}
                <TabsContent value="documents">
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Diplomes */}
                        <DocumentCard
                            title="Diplômes"
                            description="Certifications et formations"
                            icon={<GraduationCap className="h-6 w-6" />}
                            content={details?.diplomes}
                            fileUrl={details?.diplomesFile}
                            fieldName="diplomes"
                            fileFieldName="diplomesFile"
                            isEditing={isEditing}
                            color="blue"
                        />

                        {/* Assurance RCP */}
                        <DocumentCard
                            title="Assurance RCP"
                            description="Responsabilité Civile Pro"
                            icon={<Shield className="h-6 w-6" />}
                            content={details?.rcpInsurance}
                            fileUrl={details?.rcpFile}
                            fieldName="rcpInsurance"
                            fileFieldName="rcpFile"
                            isEditing={isEditing}
                            color="emerald"
                        />

                        {/* Contrat */}
                        <DocumentCard
                            title="Contrat"
                            description="Contrat de travail"
                            icon={<FileText className="h-6 w-6" />}
                            content={details?.contrat}
                            fileUrl={details?.contratFile}
                            fieldName="contrat"
                            fileFieldName="contratFile"
                            isEditing={isEditing}
                            color="violet"
                        />
                    </div>
                </TabsContent>

                {/* Absences Tab */}
                <TabsContent value="absences">
                    <AbsenceManager
                        coachId={coach.id}
                        absences={coach.absences}
                        isAdmin={isAdmin}
                        canManage={canEdit}
                    />
                </TabsContent>

                {/* Sessions Tab */}
                <TabsContent value="seances">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                Dernières Séances
                            </CardTitle>
                            <CardDescription>Historique des 10 dernières séances</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {coach.sessions.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Aucune séance enregistrée
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {coach.sessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${session.status === 'DONE' ? 'bg-emerald-100 text-emerald-600' :
                                                    session.status === 'CANCELLED' ? 'bg-rose-100 text-rose-600' :
                                                        'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    {session.status === 'DONE' ? <CheckCircle className="h-5 w-5" /> :
                                                        session.status === 'CANCELLED' ? <XCircle className="h-5 w-5" /> :
                                                            <Clock className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{session.service.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {session.client.name} • {session.service.durationMin} min
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">
                                                    {new Date(session.date).toLocaleDateString('fr-FR', {
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(session.date).toLocaleTimeString('fr-FR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Bouton de sauvegarde global en mode édition */}
                {isEditing && (
                    <div className="flex gap-3 pt-4 border-t">
                        <Button type="submit" disabled={isPending} className="flex-1">
                            {isPending ? "Enregistrement..." : "Sauvegarder toutes les modifications"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            className="flex-1"
                        >
                            Annuler
                        </Button>
                    </div>
                )}
                </Tabs>
            </form>
        </>
    )
}

// Document Card Component
function DocumentCard({
    title,
    description,
    icon,
    content,
    fileUrl,
    fieldName,
    fileFieldName,
    isEditing,
    color
}: {
    title: string
    description: string
    icon: React.ReactNode
    content?: string | null
    fileUrl?: string | null
    fieldName: string
    fileFieldName: string
    isEditing: boolean
    color: 'blue' | 'emerald' | 'violet'
}) {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-200 dark:border-blue-800',
            icon: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
            badge: 'bg-blue-100 text-blue-700'
        },
        emerald: {
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            border: 'border-emerald-200 dark:border-emerald-800',
            icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
            badge: 'bg-emerald-100 text-emerald-700'
        },
        violet: {
            bg: 'bg-violet-50 dark:bg-violet-900/20',
            border: 'border-violet-200 dark:border-violet-800',
            icon: 'bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400',
            badge: 'bg-violet-100 text-violet-700'
        }
    }

    const colors = colorClasses[color]
    const hasDocument = content || fileUrl

    return (
        <Card className={`${colors.bg} ${colors.border} border-2`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl ${colors.icon}`}>
                        {icon}
                    </div>
                    {hasDocument ? (
                        <Badge className={`${colors.badge} border-0`}>
                            <CheckCircle className="h-3 w-3 mr-1" /> Fourni
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                            Non fourni
                        </Badge>
                    )}
                </div>
                <CardTitle className="text-lg mt-3">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {content && (
                    <div className="p-3 rounded-lg bg-background/50 text-sm">
                        {content}
                    </div>
                )}

                {fileUrl && (
                    <Button variant="outline" className="w-full gap-2" asChild>
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4" /> Voir le document
                        </a>
                    </Button>
                )}

                {isEditing && (
                    <div className="pt-3 border-t border-border/50 space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor={fieldName} className="text-xs">Description</Label>
                            <Input
                                id={fieldName}
                                name={fieldName}
                                defaultValue={content || ""}
                                placeholder="Description..."
                                className="h-9 text-sm"
                            />
                        </div>
                        <Button variant="outline" size="sm" className="w-full gap-2" type="button" onClick={() => document.getElementById(fileFieldName)?.click()}>
                            <Upload className="h-4 w-4" /> {fileUrl ? "Remplacer le fichier" : "Télécharger un fichier"}
                        </Button>
                        <Input
                            id={fileFieldName}
                            name={fileFieldName}
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
