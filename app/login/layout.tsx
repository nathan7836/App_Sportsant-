import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function LoginLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Si l'utilisateur est déjà connecté, rediriger vers l'accueil
    const session = await auth()
    if (session?.user) {
        redirect("/")
    }

    // Layout minimaliste pour la page de login (sans sidebar ni header)
    return (
        <div className="min-h-[100dvh] bg-background">
            {children}
        </div>
    )
}
