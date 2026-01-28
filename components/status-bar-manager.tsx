'use client'

import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Keyboard } from '@capacitor/keyboard'

export function StatusBarManager() {
    useEffect(() => {
        const initializeNativeFeatures = async () => {
            if (!Capacitor.isNativePlatform()) return

            const platform = Capacitor.getPlatform()

            // Configure Status Bar pour iOS/Android
            try {
                await StatusBar.setStyle({ style: Style.Dark })
                await StatusBar.setBackgroundColor({ color: '#f8f7ff' })
                await StatusBar.setOverlaysWebView({ overlay: false })
                await StatusBar.show()

                // Android specific: ajouter la classe pour identifier la plateforme
                if (platform === 'android') {
                    document.documentElement.classList.add('android')
                    document.body.classList.add('platform-android')

                    // Détecter si l'appareil a un notch/cutout
                    const hasNotch = window.screen.height / window.screen.width > 2
                    if (hasNotch) {
                        document.body.classList.add('has-notch')
                    }
                }

                if (platform === 'ios') {
                    document.documentElement.classList.add('ios')
                    document.body.classList.add('platform-ios')
                }

            } catch (error) {
                console.log('StatusBar config error:', error)
            }

            // Configure Navigation Bar (Android only)
            // if (platform === 'android') {
            //     try {
            //         // Dynamic import for NavigationBar plugin
            //         // const { NavigationBar } = await import('@capgo/capacitor-navigation-bar' as any)
            //         // await NavigationBar.setColor({ color: '#f8f7ff', darkButtons: true })
            //     } catch (error) {
            //         // NavigationBar plugin not available, use CSS fallback
            //         console.log('NavigationBar plugin not available, using CSS fallback')
            //     }
            // }

            // Configure le clavier
            try {
                if (platform === 'android') {
                    // Android: keyboardDidShow/Hide
                    Keyboard.addListener('keyboardDidShow', (info) => {
                        document.body.classList.add('keyboard-visible')
                        document.documentElement.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`)
                    })

                    Keyboard.addListener('keyboardDidHide', () => {
                        document.body.classList.remove('keyboard-visible')
                        document.documentElement.style.setProperty('--keyboard-height', '0px')
                    })
                } else {
                    // iOS: keyboardWillShow/Hide
                    Keyboard.addListener('keyboardWillShow', (info) => {
                        document.body.classList.add('keyboard-visible')
                        document.documentElement.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`)
                    })

                    Keyboard.addListener('keyboardWillHide', () => {
                        document.body.classList.remove('keyboard-visible')
                        document.documentElement.style.setProperty('--keyboard-height', '0px')
                    })
                }
            } catch (error) {
                console.log('Keyboard plugin not available:', error)
            }

            // Détecter les changements d'orientation
            const handleOrientationChange = () => {
                document.body.classList.toggle('landscape', window.innerWidth > window.innerHeight)
            }
            window.addEventListener('resize', handleOrientationChange)
            handleOrientationChange()
        }

        initializeNativeFeatures()

        return () => {
            if (Capacitor.isNativePlatform()) {
                Keyboard.removeAllListeners()
            }
        }
    }, [])

    return null
}
