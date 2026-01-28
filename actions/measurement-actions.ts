'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function addMeasurement(data: {
    clientId: string
    weight?: number | null
    fatMass?: number | null
    muscleMass?: number | null
    date?: string
}) {
    const session = await auth()
    if (!session) return { error: "Non autorisé" }

    const { clientId, weight, fatMass, muscleMass, date } = data

    if (!clientId) {
        return { error: "Client ID manquant" }
    }

    try {
        const measurement = await prisma.measurement.create({
            data: {
                clientId,
                weight: weight ?? null,
                fatMass: fatMass ?? null,
                muscleMass: muscleMass ?? null,
                date: date ? new Date(date) : new Date(),
            }
        })
        revalidatePath("/clients")
        revalidatePath(`/clients/${clientId}`)
        return { success: true, message: "Mesure ajoutée", data: measurement }
    } catch (error: any) {
        console.error("Erreur ajout mesure:", error)
        if (error?.code === 'P2003') {
            return { error: "Client introuvable." }
        }
        if (error?.code === 'P1001' || error?.code === 'P1002') {
            return { error: "Erreur de connexion. Vérifiez votre réseau." }
        }
        return { error: "Erreur lors de l'ajout. Réessayez." }
    }
}

export async function getMeasurements(clientId: string) {
    const session = await auth()
    if (!session) return []

    return prisma.measurement.findMany({
        where: { clientId },
        orderBy: { date: 'desc' }
    })
}
