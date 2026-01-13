'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import bcrypt from "bcryptjs"

const CoachSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").optional().or(z.literal('')),
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
                role: "COACH"
            }
        })
        revalidatePath("/coaches")
        return { success: true, message: "Coach ajouté avec succès" }
    } catch (e) {
        return { error: "Erreur (Email déjà utilisé ?)" }
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
    } catch (e) {
        return { error: "Erreur lors de la suppression" }
    }
}

export async function updateCoach(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") return { error: "Non autorisé" }

    const userId = formData.get("userId") as string
    const name = formData.get("name") as string
    const email = formData.get("email") as string

    if (!userId) return { error: "ID manquant" }

    const validatedFields = CoachSchema.safeParse({ name, email })
    if (!validatedFields.success) return { error: validatedFields.error.issues[0].message }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                name: validatedFields.data.name,
                email: validatedFields.data.email
            }
        })
        revalidatePath("/coaches")
        return { success: true, message: "Coach modifié avec succès" }
    } catch {
        return { error: "Erreur lors de la modification (Email déjà utilisé ?)" }
    }
}
