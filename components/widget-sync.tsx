"use client"

import { useEffect } from "react"
import { registerPlugin } from "@capacitor/core"

// Define the Plugin Interface
export interface WidgetDataPlugin {
    updateWidgetData(options: { nextSession: string; time: string; coach: string }): Promise<{ success: boolean }>
}

const WidgetDataPlugin = registerPlugin<WidgetDataPlugin>("WidgetDataPlugin")

interface WidgetSyncProps {
    nextSession: any // Using any to avoid complex Prisma types import, but we know the structure
}

export function WidgetSync({ nextSession }: WidgetSyncProps) {
    useEffect(() => {
        const syncData = async () => {
            if (!nextSession) {
                // Clear widget or show "No session"
                try {
                    await WidgetDataPlugin.updateWidgetData({
                        nextSession: "Aucune séance",
                        time: "--:--",
                        coach: "Repos"
                    })
                } catch (e) {
                    console.error("Failed to sync widget (App Group not configured?)", e)
                }
                return
            }

            try {
                const date = new Date(nextSession.date)
                const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

                await WidgetDataPlugin.updateWidgetData({
                    nextSession: nextSession.service?.name || "Séance",
                    time: timeStr,
                    coach: nextSession.client?.name || "Client"
                })
                console.log("Widget synced successfully")
            } catch (e) {
                console.error("Failed to sync widget", e)
            }
        }

        syncData()
    }, [nextSession])

    return null // This component does not render anything
}
