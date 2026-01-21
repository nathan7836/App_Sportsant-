'use client'

import { useEffect, useCallback, useRef, useState } from "react"
import { checkUnsyncedSessions, markAsSynced } from "@/actions/planning-actions"
import { toast } from "sonner"

interface UnsyncedSession {
    id: string
    date: Date
    service: { name: string }
    client: { name: string }
}

// Check if running in Capacitor native app
const isNativeApp = () => {
    return typeof window !== 'undefined' &&
           (window as any).Capacitor?.isNativePlatform?.() === true
}

// Vibrate on Android (with fallback)
const vibrate = (pattern: number | number[] = 100) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
            navigator.vibrate(pattern)
        } catch (e) {
            console.log('[Notification] Vibration not supported')
        }
    }
}

export function AndroidNotificationManager({ userId }: { userId: string }) {
    const [isOnline, setIsOnline] = useState(true)
    const syncInProgress = useRef(false)
    const mountedRef = useRef(true)

    // Request notification permission on mount
    const requestNotificationPermission = useCallback(async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            return false
        }

        if (Notification.permission === 'granted') {
            return true
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission()
            return permission === 'granted'
        }

        return false
    }, [])

    // Send notification with proper handling
    const sendNotification = useCallback(async (title: string, body: string) => {
        const hasPermission = await requestNotificationPermission()

        if (hasPermission) {
            try {
                new Notification(title, {
                    body,
                    icon: '/icon-192.png',
                    tag: 'session-notification',
                } as NotificationOptions)

                // Haptic feedback on mobile
                if (isNativeApp()) {
                    vibrate([100, 50, 100])
                }
            } catch (e) {
                console.error('[Notification] Failed to send:', e)
            }
        }
    }, [requestNotificationPermission])

    // Main sync function with error handling
    const sync = useCallback(async () => {
        // Prevent concurrent syncs
        if (syncInProgress.current || !mountedRef.current || !isOnline) {
            return
        }

        syncInProgress.current = true

        try {
            const unsynced = await checkUnsyncedSessions(userId) as UnsyncedSession[] | null

            if (!mountedRef.current) return

            if (unsynced && unsynced.length > 0) {
                console.log(`[Notification] Found ${unsynced.length} new sessions for user ${userId}`)

                // Send consolidated notification for multiple sessions
                if (unsynced.length === 1) {
                    const session = unsynced[0]
                    await sendNotification(
                        "Nouvelle séance attribuée",
                        `${session.service.name} avec ${session.client.name}`
                    )
                } else {
                    await sendNotification(
                        "Nouvelles séances",
                        `${unsynced.length} séances ajoutées à votre planning`
                    )
                }

                // Show toasts for individual sessions (limit to 3 for UX)
                const sessionsToShow = unsynced.slice(0, 3)
                sessionsToShow.forEach((session, index) => {
                    setTimeout(() => {
                        if (!mountedRef.current) return

                        const sessionDate = new Date(session.date)
                        toast.info(
                            `${session.service.name} avec ${session.client.name}`,
                            {
                                description: sessionDate.toLocaleDateString('fr-FR', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }),
                                duration: 4000,
                            }
                        )
                    }, index * 500) // Stagger toasts
                })

                // Show "and X more" if there are more
                if (unsynced.length > 3) {
                    setTimeout(() => {
                        if (!mountedRef.current) return
                        toast.info(`Et ${unsynced.length - 3} autre(s) séance(s)...`, {
                            duration: 3000,
                        })
                    }, 1500)
                }

                // Mark as synced
                await markAsSynced(unsynced.map(s => s.id))
            }
        } catch (error) {
            console.error('[Notification] Sync failed:', error)
            // Don't show error toast on background sync failures
        } finally {
            syncInProgress.current = false
        }
    }, [userId, isOnline, sendNotification])

    useEffect(() => {
        mountedRef.current = true

        // Handle online/offline status
        const handleOnline = () => {
            setIsOnline(true)
            sync() // Sync when coming back online
        }
        const handleOffline = () => setIsOnline(false)

        // Handle visibility change (sync when app comes to foreground)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isOnline) {
                sync()
            }
        }

        // Initial sync
        sync()

        // Add event listeners
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        document.addEventListener('visibilitychange', handleVisibilityChange)

        // Poll every 2 minutes (less aggressive than 1 minute for battery)
        const interval = setInterval(sync, 120000)

        return () => {
            mountedRef.current = false
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            clearInterval(interval)
        }
    }, [sync, isOnline])

    return null
}
