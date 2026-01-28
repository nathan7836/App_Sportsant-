
"use server"

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

// const prisma = new PrismaClient() // REMOVED

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirectTo: "/",
        })
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
                coachDetails: role === "COACH" ? {
                    create: {} // Initialize empty details for coaches
                } : undefined
            },
        })
        revalidatePath("/admin/users")
        revalidatePath("/coaches")
        return { message: "Utilisateur créé avec succès !", success: true }
    } catch (e: any) {
        console.error("Erreur création utilisateur:", e)
        // Prisma unique constraint error
        if (e?.code === 'P2002') {
            return { message: "Cet email est déjà utilisé." }
        }
        // Network/connection errors
        if (e?.code === 'P1001' || e?.code === 'P1002') {
            return { message: "Erreur de connexion à la base de données. Réessayez." }
        }
        return { message: "Erreur lors de la création du compte. Réessayez." }
    }
}

export async function logout() {
    await signOut({ redirectTo: "/login" })
}
