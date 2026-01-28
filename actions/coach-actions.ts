'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { saveFile } from "@/lib/file-storage"

const CoachSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").optional().or(z.literal('')),
})

// Schema relaxé pour accepter File ou string
const CoachDetailsSchema = z.object({
    hourlyRate: z.coerce.number().min(0).optional(),
    diplomes: z.string().optional(),
    diplomesFile: z.any().optional(), // File or string
    rcpInsurance: z.string().optional(),
    rcpFile: z.any().optional(),
    contrat: z.string().optional(),
    contratFile: z.any().optional(),
    skills: z.string().optional(),
    specialties: z.string().optional(),
    bio: z.string().optional(),
    phone: z.string().optional(),
})

export async function createCoach(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") return { error: "Non autorisé" }

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const validatedFields = CoachSchema.safeParse({ name, email, password })
    if (!validatedFields.success) return { error: validatedFields.error.issues[0].message }
    if (!password) return { error: "Mot de passe requis pour un nouveau compte." }

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "COACH",
                coachDetails: {
                    create: {}
                }
            }
        })
        revalidatePath("/coaches")
        return { success: true, message: "Coach ajouté avec succès" }
    } catch (e: any) {
        console.error("Erreur création coach:", e)
        if (e?.code === 'P2002') {
            return { error: "Cet email est déjà utilisé." }
        }
        if (e?.code === 'P1001' || e?.code === 'P1002') {
            return { error: "Erreur de connexion. Vérifiez votre réseau." }
        }
        return { error: "Erreur lors de la création. Réessayez." }
    }
}

export async function deleteCoach(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") return { error: "Non autorisé" }

    const userId = formData.get("userId") as string
    try {
        await prisma.user.delete({ where: { id: userId } })
        revalidatePath("/coaches")
        return { success: true, message: "Coach supprimé" }
    } catch (e: any) {
        console.error("Erreur suppression coach:", e)
        if (e?.code === 'P2003' || e?.code === 'P2014') {
            return { error: "Impossible de supprimer : ce coach a des séances ou données associées." }
        }
        if (e?.code === 'P2025') {
            return { error: "Coach introuvable." }
        }
        if (e?.code === 'P1001' || e?.code === 'P1002') {
            return { error: "Erreur de connexion. Vérifiez votre réseau." }
        }
        return { error: "Erreur lors de la suppression. Réessayez." }
    }
}

export async function updateCoachDetails(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session) return { error: "Non autorisé" }

    const userId = formData.get("userId") as string
    if (!userId) return { error: "ID utilisateur manquant" }

    // Admin peut modifier tous les profils, coach peut modifier uniquement son propre profil
    const isAdmin = session.user?.role === "ADMIN"
    const isOwnProfile = session.user?.id === userId
    if (!isAdmin && !isOwnProfile) return { error: "Non autorisé" }

    const rawData = {
        hourlyRate: formData.get("hourlyRate"),
        diplomes: formData.get("diplomes"),
        diplomesFile: formData.get("diplomesFile"),
        rcpInsurance: formData.get("rcpInsurance"),
        rcpFile: formData.get("rcpFile"),
        contrat: formData.get("contrat"),
        contratFile: formData.get("contratFile"),
        skills: formData.get("skills"),
        specialties: formData.get("specialties"),
        bio: formData.get("bio"),
        phone: formData.get("phone"),
    }

    const validatedFields = CoachDetailsSchema.safeParse(rawData)
    if (!validatedFields.success) return { error: validatedFields.error.issues[0].message }

    const data = validatedFields.data

    try {
        // Handle File Uploads
        let diplomesPath = undefined
        let rcpPath = undefined
        let contratPath = undefined

        if (data.diplomesFile instanceof File && data.diplomesFile.size > 0) {
            diplomesPath = await saveFile(data.diplomesFile, "documents")
        }
        if (data.rcpFile instanceof File && data.rcpFile.size > 0) {
            rcpPath = await saveFile(data.rcpFile, "documents")
        }
        if (data.contratFile instanceof File && data.contratFile.size > 0) {
            contratPath = await saveFile(data.contratFile, "documents")
        }

        // Prepare update object
        // If path is undefined (no new file), we don't update the field
        const updateData: any = {
            hourlyRate: data.hourlyRate,
            diplomes: data.diplomes,
            rcpInsurance: data.rcpInsurance,
            contrat: data.contrat,
            skills: data.skills,
            specialties: data.specialties,
            bio: data.bio,
            phone: data.phone,
        }

        if (diplomesPath) updateData.diplomesFile = diplomesPath
        if (rcpPath) updateData.rcpFile = rcpPath
        if (contratPath) updateData.contratFile = contratPath

        // Upsert coach details
        await prisma.coachDetails.upsert({
            where: { userId },
            create: {
                userId,
                ...updateData
            },
            update: updateData,
        })

        // Update user name if provided
        const userName = formData.get("userName") as string
        if (userName) {
            await prisma.user.update({
                where: { id: userId },
                data: { name: userName }
            })
        }

        revalidatePath("/coaches")
        revalidatePath(`/coaches/${userId}`)
        return { success: true, message: "Profil mis à jour" }
    } catch (e: any) {
        console.error("Erreur mise à jour profil:", e)
        if (e?.code === 'P2025') {
            return { error: "Profil introuvable." }
        }
        if (e?.code === 'P1001' || e?.code === 'P1002') {
            return { error: "Erreur de connexion. Vérifiez votre réseau." }
        }
        return { error: "Erreur lors de la mise à jour. Réessayez." }
    }
}

export async function getCoachWithDetails(userId: string) {
    const coach = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            coachDetails: true,
            absences: {
                orderBy: { startDate: 'desc' },
                take: 10
            },
            sessions: {
                include: {
                    client: true,
                    service: true
                },
                orderBy: { date: 'desc' },
                take: 10
            }
        }
    })
    return coach
}

// ============ ABSENCES ============

const AbsenceSchema = z.object({
    startDate: z.string().min(1, "Date de début requise"),
    endDate: z.string().min(1, "Date de fin requise"),
    reason: z.string().optional(),
    type: z.enum(["CONGE", "MALADIE", "AUTRE"]).default("CONGE"),
})

export async function createAbsence(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session) return { error: "Non autorisé" }

    // Coach can create their own absence, Admin can create for anyone
    const coachId = formData.get("coachId") as string || session.user?.id
    if (!coachId) return { error: "ID coach manquant" }

    // If not admin, can only create own absence
    if (session.user?.role !== "ADMIN" && coachId !== session.user?.id) {
        return { error: "Vous ne pouvez déclarer que vos propres absences" }
    }

    const data = {
        startDate: formData.get("startDate") as string,
        endDate: formData.get("endDate") as string,
        reason: formData.get("reason") as string,
        type: formData.get("type") as string || "CONGE",
    }

    const validatedFields = AbsenceSchema.safeParse(data)
    if (!validatedFields.success) return { error: validatedFields.error.issues[0].message }

    try {
        await prisma.absence.create({
            data: {
                coachId,
                startDate: new Date(validatedFields.data.startDate),
                endDate: new Date(validatedFields.data.endDate),
                reason: validatedFields.data.reason,
                type: validatedFields.data.type,
                status: session.user?.role === "ADMIN" ? "APPROVED" : "PENDING"
            }
        })
        revalidatePath("/coaches")
        revalidatePath("/planning")
        return { success: true, message: "Absence déclarée" }
    } catch (e: any) {
        console.error("Erreur création absence:", e)
        if (e?.code === 'P1001' || e?.code === 'P1002') {
            return { error: "Erreur de connexion. Vérifiez votre réseau." }
        }
        return { error: "Erreur lors de la déclaration. Réessayez." }
    }
}

export async function updateAbsenceStatus(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") return { error: "Non autorisé" }

    const absenceId = formData.get("absenceId") as string
    const status = formData.get("status") as string

    if (!absenceId || !status) return { error: "Données manquantes" }

    try {
        await prisma.absence.update({
            where: { id: absenceId },
            data: { status }
        })
        revalidatePath("/coaches")
        return { success: true, message: `Absence ${status === "APPROVED" ? "approuvée" : "refusée"}` }
    } catch (e: any) {
        console.error("Erreur mise à jour absence:", e)
        if (e?.code === 'P2025') {
            return { error: "Absence introuvable." }
        }
        if (e?.code === 'P1001' || e?.code === 'P1002') {
            return { error: "Erreur de connexion. Vérifiez votre réseau." }
        }
        return { error: "Erreur lors de la mise à jour. Réessayez." }
    }
}

export async function deleteAbsence(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session) return { error: "Non autorisé" }

    const absenceId = formData.get("absenceId") as string
    if (!absenceId) return { error: "ID absence manquant" }

    try {
        const absence = await prisma.absence.findUnique({ where: { id: absenceId } })
        if (!absence) return { error: "Absence introuvable" }

        // Coach can only delete their own pending absences
        if (session.user?.role !== "ADMIN" && absence.coachId !== session.user?.id) {
            return { error: "Non autorisé" }
        }

        await prisma.absence.delete({ where: { id: absenceId } })
        revalidatePath("/coaches")
        return { success: true, message: "Absence supprimée" }
    } catch (e: any) {
        console.error("Erreur suppression absence:", e)
        if (e?.code === 'P2025') {
            return { error: "Absence introuvable." }
        }
        if (e?.code === 'P1001' || e?.code === 'P1002') {
            return { error: "Erreur de connexion. Vérifiez votre réseau." }
        }
        return { error: "Erreur lors de la suppression. Réessayez." }
    }
}

export async function getCoachAbsences(coachId: string) {
    return prisma.absence.findMany({
        where: { coachId },
        orderBy: { startDate: 'desc' }
    })
}

export async function getAllPendingAbsences() {
    return prisma.absence.findMany({
        where: { status: "PENDING" },
        include: { coach: true },
        orderBy: { createdAt: 'desc' }
    })
}
