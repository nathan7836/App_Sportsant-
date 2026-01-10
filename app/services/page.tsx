
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ServiceList } from "@/components/services/service-list"
import { ServiceSheet } from "@/components/services/service-sheet"

export default async function ServicesPage() {
    const session = await auth()
    if (!session) redirect("/login")

    const services = await prisma.service.findMany({
        orderBy: { name: 'asc' }
    })

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Services</h2>
                    <p className="text-muted-foreground">Définissez vos prestations et grilles tarifaires.</p>
                </div>
                <ServiceSheet />
            </div>

            <ServiceList services={services} />
        </div>
    )
}
