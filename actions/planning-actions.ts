'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const CreateSessionSchema = z.object({
    clientId: z.string().min(1, "Client requis"),
    coachId: z.string().min(1, "Coach requis"),
    serviceId: z.string().min(1, "Service requis"),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Date invalide"),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Heure invalide"),
    notes: z.string().optional(),
})

const UpdateSessionSchema = z.object({
    sessionId: z.string().min(1),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Date invalide"),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Heure invalide"),
    coachId: z.string().min(1, "Coach requis"),
    status: z.enum(['PLANNED', 'CONFIRMED', 'DONE', 'CANCELLED']).optional(),
    notes: z.string().optional(),
})

// Helper to parse DD/MM/YYYY
function parseDateString(dateStr: string): Date | null {
    if (!dateStr) return null
    if (dateStr.includes('-')) return new Date(dateStr) // Fallback for YYYY-MM-DD
    const parts = dateStr.split('/')
    if (parts.length === 3) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
    }
    return null
}

export async function createSession(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session) return { error: "Non autorisé" }

    const clientId = formData.get("clientId") as string
    const coachId = formData.get("coachId") as string
    const serviceId = formData.get("serviceId") as string
    const dateStr = formData.get("date") as string
    const timeStr = formData.get("time") as string
    const notes = formData.get("notes") as string

    // Recurrence fields
    const isRecurring = formData.get("isRecurring") === "on"
    const recurrenceEndDateStr = formData.get("recurrenceEndDate") as string
    // Get all checked days (e.g. recurrenceDays_MONDAY) or use a multi-select naming convention?
    // Easiest is to check specifically named fields if using checkboxes
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    const selectedDays: number[] = []
    daysOfWeek.forEach((day, index) => {
        if (formData.get(`day_${day}`) === "on") {
            selectedDays.push(index)
        }
    })

    if (!clientId || !coachId || !serviceId || !dateStr || !timeStr) {
        return { error: "Tous les champs obligatoires doivent être remplis." }
    }

    const startDate = parseDateString(dateStr)
    if (!startDate || isNaN(startDate.getTime())) {
        return { error: "Date invalide. Format attendu: JJ/MM/AAAA" }
    }

    // Combine time
    const [hours, minutes] = timeStr.split(':').map(Number)
    if (isNaN(hours) || isNaN(minutes)) {
        return { error: "Heure invalide." }
    }
    startDate.setHours(hours, minutes, 0, 0)

    try {
        if (isRecurring && recurrenceEndDateStr) {
            const endDate = parseDateString(recurrenceEndDateStr)
            if (!endDate) return { error: "Date de fin invalide" }
            endDate.setHours(23, 59, 59)

            if (selectedDays.length === 0) return { error: "Veuillez sélectionner au moins un jour pour la répétition." }

            const sessionsToCreate = []
            const current = new Date(startDate)

            // Loop until endDate
            while (current <= endDate) {
                if (selectedDays.includes(current.getDay())) {
                    // Create session for this day
                    sessionsToCreate.push({
                        clientId,
                        coachId,
                        serviceId,
                        date: new Date(current),
                        status: "PLANNED",
                        notes: notes ? `${notes} (Récurrent)` : "Récurrent",
                    })
                }
                // Next day
                current.setDate(current.getDate() + 1)
            }

            if (sessionsToCreate.length === 0) {
                // Fallback if the start date didn't match any day? 
                // Or maybe the user expects the start date to be included anyway?
                // Let's ensure the Specific Start Date is included IF it matches nothing? 
                // No, standard behavior: generate matching days in range.
                // Ensure start date IS included if it matches.
            }

            // Batch create
            // Prisma createMany is not supported on SQLite? 
            // "The createMany is not supported by SQLite connector." -> TRUE.
            // Must use loop.
            for (const s of sessionsToCreate) {
                await prisma.session.create({ data: s })
            }

            revalidatePath("/planning")
            revalidatePath("/")
            return { success: true, message: `${sessionsToCreate.length} séances créées.` }

        } else {
            // Single session
            await prisma.session.create({
                data: {
                    clientId,
                    coachId,
                    serviceId,
                    date: startDate,
                    status: "PLANNED",
                    notes,
                }
            })
            revalidatePath("/planning")
            revalidatePath("/")
            return { success: true }
        }

    } catch (error: any) {
        console.error("Erreur création séance:", error)
        if (error?.code === 'P2003') {
            return { error: "Client, coach ou service invalide." }
        }
        if (error?.code === 'P1001' || error?.code === 'P1002') {
            return { error: "Erreur de connexion. Vérifiez votre réseau." }
        }
        return { error: "Erreur lors de la création. Réessayez." }
    }
}

export async function updateSession(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session) return { error: "Non autorisé" }

    const validatedFields = UpdateSessionSchema.safeParse({
        sessionId: formData.get("sessionId"),
        date: formData.get("date"),
        time: formData.get("time"),
        coachId: formData.get("coachId"),
        status: formData.get("status"),
        notes: formData.get("notes"),
    })

    if (!validatedFields.success) {
        return { error: validatedFields.error.issues[0].message }
    }

    const { sessionId, date, time, coachId, status, notes } = validatedFields.data
    const dateTimeString = `${date}T${time}:00`
    const sessionDate = new Date(dateTimeString)

    try {
        await prisma.session.update({
            where: { id: sessionId },
            data: {
                date: sessionDate,
                coachId,
                status,
                notes,
            }
        })
        revalidatePath("/planning")
        revalidatePath("/")
        return { success: true, message: "Séance mise à jour" }
    } catch (error: any) {
        console.error("Erreur modification séance:", error)
        if (error?.code === 'P2025') {
            return { error: "Séance introuvable." }
        }
        if (error?.code === 'P1001' || error?.code === 'P1002') {
            return { error: "Erreur de connexion. Vérifiez votre réseau." }
        }
        return { error: "Erreur lors de la modification. Réessayez." }
    }
}

export async function deleteSession(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session) return { error: "Non autorisé" }

    const sessionId = formData.get("sessionId") as string
    if (!sessionId) return { error: "ID de séance manquant" }

    try {
        await prisma.session.delete({
            where: { id: sessionId }
        })
        revalidatePath("/planning")
        revalidatePath("/")
        return { success: true, message: "Séance supprimée" }
    } catch (error: any) {
        console.error("Erreur suppression séance:", error)
        if (error?.code === 'P2025') {
            return { error: "Séance introuvable." }
        }
        if (error?.code === 'P1001' || error?.code === 'P1002') {
            return { error: "Erreur de connexion. Vérifiez votre réseau." }
        }
        return { error: "Erreur lors de la suppression. Réessayez." }
    }
}

export async function checkUnsyncedSessions(userId: string) {
    const session = await auth()
    if (!session || session.user?.id !== userId) return null

    return prisma.session.findMany({
        where: {
            coachId: userId,
            syncedToCalendar: false,
            date: { gte: new Date() }
        },
        include: {
            client: true,
            service: true
        }
    })
}

export async function markAsSynced(sessionIds: string[]) {
    const session = await auth()
    if (!session) return

    await prisma.session.updateMany({
        where: { id: { in: sessionIds } },
        data: { syncedToCalendar: true }
    })
}
