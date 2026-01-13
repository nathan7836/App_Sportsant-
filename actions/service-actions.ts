'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const ServiceSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    price: z.coerce.number().min(0, "Le prix doit être positif"),
    durationMin: z.coerce.number().min(1, "La durée doit être positive"),
    description: z.string().optional(),
})

export async function createService(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") return { error: "Non autorisé" }

    const validatedFields = ServiceSchema.safeParse({
        name: formData.get("name"),
        price: formData.get("price"),
        durationMin: formData.get("durationMin"),
        description: formData.get("description"),
    })

    if (!validatedFields.success) {
        return { error: validatedFields.error.issues[0].message }
    }

    try {
        await prisma.service.create({
            data: validatedFields.data
        })
        revalidatePath("/services")
        return { success: true, message: "Service créé avec succès" }
    } catch {
        return { error: "Erreur lors de la création du service." }
    }
}

export async function updateService(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") return { error: "Non autorisé" }

    const serviceId = formData.get("serviceId") as string
    if (!serviceId) return { error: "ID de service manquant" }

    const validatedFields = ServiceSchema.safeParse({
        name: formData.get("name"),
        price: formData.get("price"),
        durationMin: formData.get("durationMin"),
        description: formData.get("description"),
    })

    if (!validatedFields.success) {
        return { error: validatedFields.error.issues[0].message }
    }

    try {
        await prisma.service.update({
            where: { id: serviceId },
            data: validatedFields.data
        })
        revalidatePath("/services")
        return { success: true, message: "Service mis à jour" }
    } catch {
        return { error: "Erreur lors de la modification." }
    }
}

export async function deleteService(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") return { error: "Non autorisé" }

    const serviceId = formData.get("serviceId") as string
    if (!serviceId) return { error: "ID de service manquant" }

    try {
        // Check for existing sessions
        const existingSessions = await prisma.session.count({
            where: { serviceId }
        })

        if (existingSessions > 0) {
            return { error: "Impossible de supprimer : ce service est utilisé dans des séances planifiées." }
        }

        await prisma.service.delete({
            where: { id: serviceId }
        })
        revalidatePath("/services")
        return { success: true, message: "Service supprimé" }
    } catch {
        return { error: "Erreur lors de la suppression." }
    }
}
