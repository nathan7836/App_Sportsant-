'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Créer une demande de modification/annulation
export async function createSessionChangeRequest(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user) return { error: "Non autorisé" }

    const sessionId = formData.get("sessionId") as string
    const type = formData.get("type") as string // CANCEL ou RESCHEDULE
    const reason = formData.get("reason") as string
    const newDateStr = formData.get("newDate") as string
    const newTimeStr = formData.get("newTime") as string

    if (!sessionId || !type || !reason) {
        return { error: "Tous les champs obligatoires doivent être remplis." }
    }

    // Vérifier que la séance existe et appartient au coach
    const targetSession = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { client: true, service: true, coach: true }
    })

    if (!targetSession) {
        return { error: "Séance introuvable." }
    }

    // Vérifier que c'est bien le coach de la séance (sauf si admin)
    if (session.user.role !== 'ADMIN' && targetSession.coachId !== session.user.id) {
        return { error: "Vous n'êtes pas autorisé à modifier cette séance." }
    }

    // Vérifier que la séance est dans plus de 24h
    const now = new Date()
    const sessionDate = new Date(targetSession.date)
    const hoursUntilSession = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilSession < 24) {
        return { error: "Impossible de demander une modification moins de 24h avant la séance." }
    }

    // Vérifier qu'il n'y a pas déjà une demande en attente
    const existingRequest = await prisma.sessionChangeRequest.findFirst({
        where: {
            sessionId,
            status: 'PENDING'
        }
    })

    if (existingRequest) {
        return { error: "Une demande est déjà en attente pour cette séance." }
    }

    // Préparer la nouvelle date si c'est un report
    let newDate: Date | null = null
    if (type === 'RESCHEDULE' && newDateStr && newTimeStr) {
        newDate = new Date(`${newDateStr}T${newTimeStr}:00`)
        if (isNaN(newDate.getTime())) {
            return { error: "Date ou heure invalide." }
        }
    }

    try {
        // Créer la demande
        const request = await prisma.sessionChangeRequest.create({
            data: {
                sessionId,
                coachId: session.user.id!,
                type,
                reason,
                newDate,
                status: 'PENDING'
            }
        })

        // Notifier tous les admins
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' }
        })

        const typeLabel = type === 'CANCEL' ? 'annulation' : 'report'
        for (const admin of admins) {
            await prisma.notification.create({
                data: {
                    userId: admin.id,
                    type: 'REQUEST_NEW',
                    title: `Demande de ${typeLabel}`,
                    message: `${targetSession.coach.name || targetSession.coach.email} demande ${type === 'CANCEL' ? "l'annulation" : "le report"} de la séance avec ${targetSession.client.name} (${targetSession.service.name}).`,
                    link: '/admin/requests'
                }
            })
        }

        revalidatePath("/planning")
        revalidatePath("/admin/requests")
        return { success: true, message: "Demande envoyée avec succès." }

    } catch (error: any) {
        console.error("Erreur création demande:", error)
        if (error?.code === 'P1001' || error?.code === 'P1002') {
            return { error: "Erreur de connexion. Vérifiez votre réseau." }
        }
        return { error: "Erreur lors de la création de la demande. Réessayez." }
    }
}

// Répondre à une demande (admin)
export async function respondToSessionChangeRequest(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
        return { error: "Non autorisé" }
    }

    const requestId = formData.get("requestId") as string
    const action = formData.get("action") as string // APPROVE ou REJECT
    const adminResponse = formData.get("adminResponse") as string

    if (!requestId || !action) {
        return { error: "Données manquantes." }
    }

    const request = await prisma.sessionChangeRequest.findUnique({
        where: { id: requestId },
        include: {
            session: {
                include: { client: true, service: true, coach: true }
            }
        }
    })

    if (!request) {
        return { error: "Demande introuvable." }
    }

    if (request.status !== 'PENDING') {
        return { error: "Cette demande a déjà été traitée." }
    }

    try {
        const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED'

        // Mettre à jour la demande
        await prisma.sessionChangeRequest.update({
            where: { id: requestId },
            data: {
                status: newStatus,
                adminResponse,
                respondedAt: new Date()
            }
        })

        // Si approuvé, appliquer les changements à la séance
        if (action === 'APPROVE') {
            if (request.type === 'CANCEL') {
                await prisma.session.update({
                    where: { id: request.sessionId },
                    data: { status: 'CANCELLED' }
                })
            } else if (request.type === 'RESCHEDULE' && request.newDate) {
                await prisma.session.update({
                    where: { id: request.sessionId },
                    data: { date: request.newDate }
                })
            }
        }

        // Notifier le coach
        const typeLabel = request.type === 'CANCEL' ? "d'annulation" : "de report"
        const statusLabel = action === 'APPROVE' ? 'acceptée' : 'refusée'

        await prisma.notification.create({
            data: {
                userId: request.coachId,
                type: action === 'APPROVE' ? 'REQUEST_APPROVED' : 'REQUEST_REJECTED',
                title: `Demande ${statusLabel}`,
                message: `Votre demande ${typeLabel} pour la séance avec ${request.session.client.name} a été ${statusLabel}.${adminResponse ? ` Réponse: ${adminResponse}` : ''}`,
                link: '/planning'
            }
        })

        revalidatePath("/planning")
        revalidatePath("/admin/requests")
        return { success: true, message: `Demande ${statusLabel}.` }

    } catch (error: any) {
        console.error("Erreur traitement demande:", error)
        if (error?.code === 'P2025') {
            return { error: "Demande ou séance introuvable." }
        }
        if (error?.code === 'P1001' || error?.code === 'P1002') {
            return { error: "Erreur de connexion. Vérifiez votre réseau." }
        }
        return { error: "Erreur lors du traitement. Réessayez." }
    }
}

// Récupérer les demandes en attente (admin)
export async function getPendingRequests() {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
        return []
    }

    return prisma.sessionChangeRequest.findMany({
        where: { status: 'PENDING' },
        include: {
            session: {
                include: {
                    client: true,
                    service: true,
                    coach: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}

// Récupérer l'historique des demandes d'un coach
export async function getMyRequests() {
    const session = await auth()
    if (!session?.user) return []

    return prisma.sessionChangeRequest.findMany({
        where: { coachId: session.user.id },
        include: {
            session: {
                include: {
                    client: true,
                    service: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
}

// Récupérer les notifications d'un utilisateur
export async function getMyNotifications() {
    const session = await auth()
    if (!session?.user) return []

    return prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 20
    })
}

// Compter les notifications non lues
export async function getUnreadNotificationsCount() {
    const session = await auth()
    if (!session?.user) return 0

    return prisma.notification.count({
        where: {
            userId: session.user.id,
            read: false
        }
    })
}

// Marquer une notification comme lue
export async function markNotificationAsRead(notificationId: string) {
    const session = await auth()
    if (!session?.user) return

    await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true }
    })

    revalidatePath("/")
}

// Marquer toutes les notifications comme lues
export async function markAllNotificationsAsRead() {
    const session = await auth()
    if (!session?.user) return

    await prisma.notification.updateMany({
        where: {
            userId: session.user.id,
            read: false
        },
        data: { read: true }
    })

    revalidatePath("/")
}
