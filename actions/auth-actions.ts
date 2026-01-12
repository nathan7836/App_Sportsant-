
"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { z } from "zod"
// import { PrismaClient } from "@prisma/client" // REMOVED
import { prisma } from "@/lib/prisma" // ADDED
import bcrypt from "bcryptjs"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache" // ADDED

// const prisma = new PrismaClient() // REMOVED

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn("credentials", formData)
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Identifiants invalides."
                default:
                    return "Une erreur est survenue."
            }
        }
        throw error
    }
}

const CreateUserSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["ADMIN", "COACH"]),
})

export async function createUser(prevState: any, formData: FormData) {
    const session = await auth()
    const user = session?.user as any
    if (user?.role !== "ADMIN") {
        return { message: "Non autorisé. Seuls les administrateurs peuvent créer des comptes." }
    }

    const validatedFields = CreateUserSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        role: formData.get("role"),
    })

    if (!validatedFields.success) {
        return { message: "Champs invalides." }
    }

    const { name, email, password, role } = validatedFields.data
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
            },
        })
        revalidatePath("/admin/users") // ADDED
        return { message: "Utilisateur créé avec succès !", success: true }
    } catch (e) {
        return { message: "Erreur : Cet email est peut-être déjà utilisé." }
    }
}
