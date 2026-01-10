
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CoachList } from "@/components/coaches/coach-list"
import Link from "next/link"

export default async function CoachesPage() {
    const session = await auth()
    if (!session) redirect("/login")

    // Fetch users who are COACHES
    const coaches = await prisma.user.findMany({
        where: { role: "COACH" },
        orderBy: { createdAt: 'desc' }
    })

    const isAdmin = session.user?.role === "ADMIN"

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Coachs</h2>
                    <p className="text-muted-foreground">Gestion de l'équipe.</p>
                </div>
                {isAdmin && (
                    <Button asChild className="bg-primary text-primary-foreground shadow-lg font-bold">
                        <Link href="/admin/users">
                            <Plus className="mr-2 h-4 w-4" /> Nouveau Coach
                        </Link>
                    </Button>
                )}
            </div>

            <CoachList coaches={coaches} currentUserRole={session.user?.role} />
        </div>
    )
}
