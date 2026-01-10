'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const ClientSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    email: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    objective: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
})

export async function createClient(prevState: any, formData: FormData) {
    const session = await auth()
    // Allow any authenticated user to create? Or restrict? 
    // User asked for "supprimer ou modifier" restriction. 
    // Usually Invite/Create is also Admin, but stick to specific request or safe default.
    // Let's restrict Create to Admin too for consistency, or standard users (Coaches) might need to add clients?
    // "uniquement l'admin puisse supprimer un client ou le modifier" -> Create is ambiguous.
    // I'll leave Create open to Coaches for now unless specified, but commonly Coaches add their clients.
    // Wait, the previous code had `if (!session || session.user?.role !== "ADMIN")` in my quick edit attempt.
    // Let's stick to restricting everything to Admin for "Gestion", assuming Coaches just view.
    if (!session) return { error: "Non autorisé" }

    // If we want to strictly follow "delete or modify", Create might be allowed. 
    // But commonly "Gestion" implies full control. 
    // I will allow Create for now for regular users (Coaches need to add people?), 
    // BUT enforce Admin for Update/Delete as explicitly requested.

    const validatedFields = ClientSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        objective: formData.get("objective"),
        notes: formData.get("notes"),
    })

    if (!validatedFields.success) {
        return { error: validatedFields.error.issues[0].message }
    }

    try {
        await prisma.client.create({
            data: validatedFields.data
        })
        revalidatePath("/clients")
        return { success: true, message: "Client ajouté" }
    } catch (error) {
        console.error(error)
        return { error: "Erreur lors de la création." }
    }
}

export async function updateClient(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") return { error: "Action réservée aux administrateurs." }

    const clientId = formData.get("clientId") as string
    if (!clientId) return { error: "ID manquant" }

    const validatedFields = ClientSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        objective: formData.get("objective"),
        notes: formData.get("notes"),
    })

    if (!validatedFields.success) {
        return { error: validatedFields.error.issues[0].message }
    }

    try {
        await prisma.client.update({
            where: { id: clientId },
            data: validatedFields.data
        })
        revalidatePath("/clients")
        return { success: true, message: "Client modifié" }
    } catch (error) {
        console.error(error)
        return { error: "Erreur lors de la modification." }
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
    } catch (error) {
        console.error(error)
        return { error: "Impossible de supprimer (Client lié à des séances ?)" }
    }
}
