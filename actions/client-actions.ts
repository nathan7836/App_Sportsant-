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
    if (!session) return { error: "Non autorisé" }

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
    } catch {
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
    } catch {
        return { error: "Erreur lors de la modification." }
    }
}

export async function deleteClient(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") return { error: "Action réservée aux administrateurs." }

    const clientId = formData.get("clientId") as string
    if (!clientId) return { error: "ID manquant" }

    try {
        await prisma.client.delete({
            where: { id: clientId }
        })
        revalidatePath("/clients")
        return { success: true, message: "Client supprimé" }
    } catch {
        return { error: "Impossible de supprimer (Client lié à des séances ?)" }
    }
}
