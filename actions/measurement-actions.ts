'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const MeasurementSchema = z.object({
    clientId: z.string().min(1),
    weight: z.coerce.number().min(0).optional(),
    fatMass: z.coerce.number().min(0).optional(),
    muscleMass: z.coerce.number().min(0).optional(),
    date: z.string().optional(), // YYYY-MM-DD
    notes: z.string().optional(),
})

export async function addMeasurement(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session) return { error: "Non autorisé" }

    const validated = MeasurementSchema.safeParse({
        clientId: formData.get("clientId"),
        weight: formData.get("weight"),
        fatMass: formData.get("fatMass"),
        muscleMass: formData.get("muscleMass"),
        date: formData.get("date"),
        notes: formData.get("notes"),
    })

    if (!validated.success) {
        return { error: "Données invalides" }
    }

    const { clientId, weight, fatMass, muscleMass, date, notes } = validated.data

    try {
        await prisma.measurement.create({
            data: {
                clientId,
                weight: weight || null,
                fatMass: fatMass || null,
                muscleMass: muscleMass || null,
                date: date ? new Date(date) : new Date(),
                notes,
            }
        })
        revalidatePath("/clients")
        return { success: true, message: "Mesure ajoutée" }
    } catch (error) {
        console.error("Failed to add measurement:", error)
        return { error: "Erreur lors de l'ajout" }
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
