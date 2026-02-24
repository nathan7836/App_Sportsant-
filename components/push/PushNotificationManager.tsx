'use client'

import { useEffect, useRef } from 'react'
import { Capacitor } from '@capacitor/core'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function PushNotificationManager({ userId }: { userId: string }) {
    const router = useRouter()
    const registeredRef = useRef(false)

    useEffect(() => {
        console.warn('[Push] PushNotificationManager mounted, userId:', userId)
        console.warn('[Push] isNativePlatform:', Capacitor.isNativePlatform())
        console.warn('[Push] platform:', Capacitor.getPlatform())
        console.warn('[Push] registeredRef:', registeredRef.current)

        if (!Capacitor.isNativePlatform() || registeredRef.current) {
            console.warn('[Push] Skipping setup (not native or already registered)')
            return
        }
        registeredRef.current = true

        const setupPush = async () => {
            try {
                console.warn('[Push] Importing PushNotifications...')
                const { PushNotifications } = await import('@capacitor/push-notifications')
                console.warn('[Push] PushNotifications imported OK')

                let permStatus = await PushNotifications.checkPermissions()
                console.warn('[Push] Current permission status:', permStatus.receive)

                if (permStatus.receive === 'prompt') {
                    console.warn('[Push] Requesting permissions...')
                    permStatus = await PushNotifications.requestPermissions()
                    console.warn('[Push] Permission result:', permStatus.receive)
                }

                if (permStatus.receive !== 'granted') {
                    console.warn('[Push] Permission not granted, aborting')
                    return
                }

                // 1. D'ABORD enregistrer tous les listeners (avant register!)
                PushNotifications.addListener('registration', async (tokenData) => {
                    console.error('--- TOKEN_FIREBASE_POUR_TEST --- ' + tokenData.value)
                    console.warn('[Push] Token length:', tokenData.value.length)
                    const platform = Capacitor.getPlatform()

                    try {
                        console.warn('[Push] Sending token to /api/push/register...')
                        const response = await fetch('/api/push/register', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                token: tokenData.value,
                                platform,
                            }),
                        })
                        const data = await response.json()
                        console.warn('[Push] Register response:', response.status, JSON.stringify(data))

                        if (!response.ok) {
                            console.error('[Push] Registration failed with status:', response.status)
                        }
                    } catch (err) {
                        console.error('[Push] Failed to register token:', err)
                    }
                })

                PushNotifications.addListener('registrationError', (error) => {
                    console.error('[Push] Registration error:', JSON.stringify(error))
                })

                PushNotifications.addListener('pushNotificationReceived', (notification) => {
                    console.warn('[Push] Notification received in foreground:', notification.title)
                    toast.info(notification.title || 'Notification', {
                        description: notification.body,
                        duration: 5000,
                    })
                })

                PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
                    console.warn('[Push] Notification tapped:', action.notification.data)
                    const link = action.notification.data?.link
                    if (link) {
                        router.push(link)
                    }
                })

                // 2. ENSUITE lancer l'enregistrement APNs
                console.warn('[Push] All listeners ready, calling register()...')
                await PushNotifications.register()
                console.warn('[Push] register() called')
            } catch (error) {
                console.error('[Push] Setup failed:', error)
            }
        }

        setupPush()

        return () => {
            import('@capacitor/push-notifications').then(({ PushNotifications }) => {
                PushNotifications.removeAllListeners()
            })
        }
    }, [userId, router])

    return null
}
