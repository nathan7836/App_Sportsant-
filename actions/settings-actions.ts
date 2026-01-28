'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const SettingsSchema = z.object({
    monthlyGoal: z.coerce.number().min(0, "Le montant doit être positif"),
})

export async function getGlobalSettings() {
    try {
        const settings = await prisma.globalSettings.findUnique({
            where: { id: "default" }
        })

        if (!settings) {
            return await prisma.globalSettings.create({
                data: { id: "default", monthlyGoal: 2000.0 }
            })
        }

        return settings
    } catch (e) {
        console.error("Failed to fetch settings:", e)
        return { id: "default", monthlyGoal: 2000.0 }
    }
}

export async function updateMonthlyGoal(formData: FormData) {
    const session = await auth()
    if (!session) return { error: "Non autorisé" }

    const validatedFields = SettingsSchema.safeParse({
        monthlyGoal: formData.get("monthlyGoal"),
    })

    if (!validatedFields.success) {
        return { error: validatedFields.error.issues[0].message }
    }

    try {
        await prisma.globalSettings.upsert({
            where: { id: "default" },
            update: { monthlyGoal: validatedFields.data.monthlyGoal },
            create: { id: "default", monthlyGoal: validatedFields.data.monthlyGoal }
        })

        revalidatePath("/billing")
        revalidatePath("/") // Also dashboard
        return { success: true, message: "Objectif mis à jour" }
    } catch (error: any) {
        console.error("Erreur mise à jour paramètres:", error)
        if (error?.code === 'P1001' || error?.code === 'P1002') {
            return { error: "Erreur de connexion. Vérifiez votre réseau." }
        }
        return { error: "Erreur lors de la mise à jour. Réessayez." }
    }
}
