import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { getCoachWithDetails } from "@/actions/coach-actions"
import { CoachProfileView } from "@/components/coaches/CoachProfileView"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function CoachProfilePage({ params }: PageProps) {
    const session = await auth()
    if (!session) redirect("/login")

    const { id } = await params
    const coach = await getCoachWithDetails(id)

    if (!coach) {
        notFound()
    }

    const isAdmin = session.user?.role === "ADMIN"
    const isOwnProfile = session.user?.id === coach.id

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0">
            <CoachProfileView
                coach={coach}
                isAdmin={isAdmin}
                isOwnProfile={isOwnProfile}
            />
        </div>
    )
}
