'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const ClientSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    email: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    birthDate: z.string().optional().nullable(),
    height: z.coerce.number().optional().nullable(),
    pathology: z.string().optional().nullable(),
    goals: z.string().optional().nullable(),
    emergencyContact: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
})

export async function createClient(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session) return { error: "Non autorisé" }

    const validatedFields = ClientSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        address: formData.get("address"),
        birthDate: formData.get("birthDate"),
        height: formData.get("height"),
        pathology: formData.get("pathology"),
        goals: formData.get("goals"),
        emergencyContact: formData.get("emergencyContact"),
        notes: formData.get("notes"),
    })

    if (!validatedFields.success) {
        return { error: validatedFields.error.issues[0].message }
    }

    try {
        const data = {
            ...validatedFields.data,
            birthDate: validatedFields.data.birthDate ? new Date(validatedFields.data.birthDate) : null,
        }

        await prisma.client.create({
            data
        })
        revalidatePath("/clients")
        return { success: true, message: "Client ajouté" }
    } catch (error: any) {
        console.error("Erreur création client:", error)
        if (error?.code === 'P2002') {
            return { error: "Un client avec ces informations existe déjà." }
        }
        if (error?.code === 'P1001' || error?.code === 'P1002') {
            return { error: "Erreur de connexion. Vérifiez votre réseau." }
        }
        return { error: "Erreur lors de la création. Réessayez." }
    }
}

export async function updateClient(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") return { error: "Action réservée aux administrateurs." }

    const clientId = formData.get("id") as string // Matching the generic 'id' appended in form
    if (!clientId) return { error: "ID manquant" }

    const validatedFields = ClientSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        address: formData.get("address"),
        birthDate: formData.get("birthDate"),
        height: formData.get("height"),
        pathology: formData.get("pathology"),
        goals: formData.get("goals"),
        emergencyContact: formData.get("emergencyContact"),
        notes: formData.get("notes"),
    })

    if (!validatedFields.success) {
        return { error: validatedFields.error.issues[0].message }
    }

    try {
        const data = {
            ...validatedFields.data,
            birthDate: validatedFields.data.birthDate ? new Date(validatedFields.data.birthDate) : null,
        }

        await prisma.client.update({
            where: { id: clientId },
            data
        })
        revalidatePath("/clients")
        return { success: true, message: "Client modifié" }
    } catch (error: any) {
        console.error("Erreur modification client:", error)
        if (error?.code === 'P2025') {
            return { error: "Client introuvable." }
        }
        if (error?.code === 'P1001' || error?.code === 'P1002') {
            return { error: "Erreur de connexion. Vérifiez votre réseau." }
        }
        return { error: "Erreur lors de la modification. Réessayez." }
    }
}

export async function deleteClient(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") return { error: "Action réservée aux administrateurs." }

    const clientId = formData.get("clientId") as string
    if (!clientId) return { error: "ID manquant" }

    try {
        // Optional: Check for sessions? Prisma might error if FK constraint.
        // For now, let's try delete.
        await prisma.client.delete({
            where: { id: clientId }
        })
        revalidatePath("/clients")
        return { success: true, message: "Client supprimé" }
    } catch (error: any) {
        console.error("Erreur suppression client:", error)
        if (error?.code === 'P2003' || error?.code === 'P2014') {
            return { error: "Impossible de supprimer : ce client a des séances associées." }
        }
        if (error?.code === 'P2025') {
            return { error: "Client introuvable." }
        }
        if (error?.code === 'P1001' || error?.code === 'P1002') {
            return { error: "Erreur de connexion. Vérifiez votre réseau." }
        }
        return { error: "Erreur lors de la suppression. Réessayez." }
    }
}
