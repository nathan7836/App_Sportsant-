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

const ManageServiceSchema = ServiceSchema.extend({
    serviceId: z.string().optional(), // Optional for create, required for update if we strictly separated... but commonly used for upsert pattern or distinct ID field
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
    } catch (error: any) {
        console.error("Erreur création service:", error)
        if (error?.code === 'P2002') {
            return { error: "Un service avec ce nom existe déjà." }
        }
        if (error?.code === 'P1001' || error?.code === 'P1002') {
            return { error: "Erreur de connexion. Vérifiez votre réseau." }
        }
        return { error: "Erreur lors de la création. Réessayez." }
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
    } catch (error: any) {
        console.error("Erreur modification service:", error)
        if (error?.code === 'P2025') {
            return { error: "Service introuvable." }
        }
        if (error?.code === 'P1001' || error?.code === 'P1002') {
            return { error: "Erreur de connexion. Vérifiez votre réseau." }
        }
        return { error: "Erreur lors de la modification. Réessayez." }
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
    } catch (error: any) {
        console.error("Erreur suppression service:", error)
        if (error?.code === 'P2025') {
            return { error: "Service introuvable." }
        }
        if (error?.code === 'P2003' || error?.code === 'P2014') {
            return { error: "Impossible de supprimer : ce service est utilisé." }
        }
        if (error?.code === 'P1001' || error?.code === 'P1002') {
            return { error: "Erreur de connexion. Vérifiez votre réseau." }
        }
        return { error: "Erreur lors de la suppression. Réessayez." }
    }
}
