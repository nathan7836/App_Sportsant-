"use client"

import { useEffect, useRef, useCallback } from "react"
import { registerPlugin } from "@capacitor/core"

// Define the Plugin Interface - matches iOS WidgetData structure
export interface WidgetDataPlugin {
    updateWidgetData(options: {
        nextSession: string
        time: string
        coach: string
    }): Promise<{ success: boolean }>
}

// Only register plugin if in browser environment
let WidgetDataPlugin: WidgetDataPlugin | null = null
if (typeof window !== 'undefined') {
    try {
        WidgetDataPlugin = registerPlugin<WidgetDataPlugin>("WidgetDataPlugin")
    } catch (e) {
        console.log('[WidgetSync] Plugin not available (web mode)')
    }
}

// Check if running on iOS native app
const isIOSNativeApp = () => {
    if (typeof window === 'undefined') return false
    const cap = (window as any).Capacitor
    return cap?.isNativePlatform?.() === true && cap?.getPlatform?.() === 'ios'
}

interface SessionData {
    id?: string
    date: Date | string
    status?: string
    service?: { name: string; durationMin?: number }
    client?: { name: string }
    coach?: { name: string | null; email?: string }
    notes?: string | null
}

interface WidgetSyncProps {
    nextSession: SessionData | null
}

export function WidgetSync({ nextSession }: WidgetSyncProps) {
    const lastSyncRef = useRef<string | null>(null)
    const mountedRef = useRef(true)

    // Format date for widget display
    const formatWidgetTime = useCallback((date: Date): string => {
        const today = new Date()
        const sessionDate = new Date(date)
        const isToday = sessionDate.toDateString() === today.toDateString()

        const timeStr = sessionDate.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        })

        if (isToday) {
            return timeStr
        }

        // For future dates, include day
        const dayStr = sessionDate.toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric'
        })

        return `${dayStr} ${timeStr}`
    }, [])

    // Sync data to widget
    const syncData = useCallback(async () => {
        // Only run on iOS native app
        if (!isIOSNativeApp() || !WidgetDataPlugin) {
            return
        }

        if (!mountedRef.current) return

        // Generate a sync key to prevent duplicate syncs
        const syncKey = nextSession ? `${nextSession.id}-${nextSession.date}` : 'no-session'
        if (syncKey === lastSyncRef.current) {
            return // Already synced this data
        }

        try {
            if (!nextSession) {
                // No upcoming session
                await WidgetDataPlugin.updateWidgetData({
                    nextSession: "Aucune séance",
                    time: "Repos",
                    coach: "🏋️"
                })
                lastSyncRef.current = syncKey
                console.log('[WidgetSync] Cleared widget - no session')
                return
            }

            const date = new Date(nextSession.date)
            const timeStr = formatWidgetTime(date)

            // Build display strings
            const sessionName = nextSession.service?.name || "Séance"
            const clientName = nextSession.client?.name || "Client"

            // Sync to widget
            await WidgetDataPlugin.updateWidgetData({
                nextSession: sessionName,
                time: timeStr,
                coach: clientName
            })

            lastSyncRef.current = syncKey
            console.log('[WidgetSync] Widget synced:', { sessionName, timeStr, clientName })

        } catch (e) {
            console.error('[WidgetSync] Failed to sync:', e)
            // Don't update lastSyncRef so we retry next time
        }
    }, [nextSession, formatWidgetTime])

    useEffect(() => {
        mountedRef.current = true

        // Initial sync
        syncData()

        // Re-sync when app becomes visible (user might have looked at widget)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Reset sync key to force refresh when app opens
                lastSyncRef.current = null
                syncData()
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            mountedRef.current = false
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [syncData])

    // Re-sync when session data changes
    useEffect(() => {
        syncData()
    }, [nextSession, syncData])

    return null
}
