'use client'

import { useEffect } from "react"
import { checkUnsyncedSessions, markAsSynced } from "@/actions/planning-actions"
import { toast } from "sonner"

export function AndroidNotificationManager({ userId }: { userId: string }) {
    useEffect(() => {
        const sync = async () => {
            const unsynced = await checkUnsyncedSessions(userId)
            if (unsynced && unsynced.length > 0) {
                // Android Notification
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification("Nouveau Coaching Attribué", {
                        body: `Vous avez ${unsynced.length} nouvelle(s) séance(s) ajoutée(s) à votre planning.`
                    })
                } else if ('Notification' in window && Notification.permission !== 'denied') {
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            new Notification("Nouveau Coaching Attribué", {
                                body: `Vous avez ${unsynced.length} nouvelle(s) séance(s) ajoutée(s) à votre planning.`
                            })
                        }
                    })
                }

                // Calendar Add and Toast
                unsynced.forEach(session => {
                    toast.info(`Ajout au calendrier: ${session.service.name} avec ${session.client.name}`, {
                        description: `${new Date(session.date).toLocaleDateString()} à ${new Date(session.date).toLocaleTimeString()}`
                    })
                })

                // Mark as synced
                await markAsSynced(unsynced.map(s => s.id))
            }
        }

        // Run on mount (App open)
        sync()

        // Optional: Poll every minute?
        const interval = setInterval(sync, 60000)
        return () => clearInterval(interval)
    }, [userId])

    return null
}
