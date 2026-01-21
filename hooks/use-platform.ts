"use client"

import { useState, useEffect, useMemo } from "react"

export type Platform = 'ios' | 'android' | 'web'
export type DeviceType = 'mobile' | 'tablet' | 'desktop'

interface PlatformInfo {
    platform: Platform
    deviceType: DeviceType
    isNative: boolean
    isIOS: boolean
    isAndroid: boolean
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
    hasTouchScreen: boolean
    hasNotch: boolean
    safeAreaInsets: {
        top: number
        bottom: number
        left: number
        right: number
    }
}

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

// Detect if running in Capacitor native app
function detectIsNative(): boolean {
    if (typeof window === 'undefined') return false
    return (window as any).Capacitor?.isNativePlatform?.() === true
}

// Get Capacitor platform
function detectCapacitorPlatform(): Platform {
    if (typeof window === 'undefined') return 'web'
    const cap = (window as any).Capacitor
    if (cap?.isNativePlatform?.() === true) {
        const platform = cap.getPlatform?.()
        if (platform === 'ios') return 'ios'
        if (platform === 'android') return 'android'
    }
    return 'web'
}

// Detect device type based on viewport
function detectDeviceType(): DeviceType {
    if (typeof window === 'undefined') return 'desktop'
    const width = window.innerWidth
    if (width < MOBILE_BREAKPOINT) return 'mobile'
    if (width < TABLET_BREAKPOINT) return 'tablet'
    return 'desktop'
}

// Detect touch capability
function detectTouchScreen(): boolean {
    if (typeof window === 'undefined') return false
    return 'ontouchstart' in window ||
           navigator.maxTouchPoints > 0 ||
           (navigator as any).msMaxTouchPoints > 0
}

// Detect iOS notch (approximate based on safe area)
function detectNotch(): boolean {
    if (typeof window === 'undefined' || typeof CSS === 'undefined') return false

    // Check if CSS env() is supported and if there's a safe area inset
    const hasEnv = CSS.supports('padding-top', 'env(safe-area-inset-top)')
    if (!hasEnv) return false

    // Create test element
    const testDiv = document.createElement('div')
    testDiv.style.paddingTop = 'env(safe-area-inset-top, 0px)'
    document.body.appendChild(testDiv)
    const computedStyle = getComputedStyle(testDiv)
    const paddingTop = parseInt(computedStyle.paddingTop, 10)
    document.body.removeChild(testDiv)

    return paddingTop > 20 // Notch devices typically have 44px+ safe area
}

// Get safe area insets
function getSafeAreaInsets(): PlatformInfo['safeAreaInsets'] {
    if (typeof window === 'undefined' || typeof CSS === 'undefined') {
        return { top: 0, bottom: 0, left: 0, right: 0 }
    }

    const getInset = (position: string): number => {
        const testDiv = document.createElement('div')
        testDiv.style.position = 'fixed'
        testDiv.style[`padding${position.charAt(0).toUpperCase() + position.slice(1)}` as any] = `env(safe-area-inset-${position}, 0px)`
        document.body.appendChild(testDiv)
        const value = parseInt(getComputedStyle(testDiv)[`padding${position.charAt(0).toUpperCase() + position.slice(1)}` as any], 10) || 0
        document.body.removeChild(testDiv)
        return value
    }

    return {
        top: getInset('top'),
        bottom: getInset('bottom'),
        left: getInset('left'),
        right: getInset('right')
    }
}

export function usePlatform(): PlatformInfo {
    const [mounted, setMounted] = useState(false)
    const [deviceType, setDeviceType] = useState<DeviceType>('desktop')

    useEffect(() => {
        setMounted(true)
        setDeviceType(detectDeviceType())

        const handleResize = () => {
            setDeviceType(detectDeviceType())
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const platformInfo = useMemo((): PlatformInfo => {
        if (!mounted) {
            // Server-side defaults
            return {
                platform: 'web',
                deviceType: 'desktop',
                isNative: false,
                isIOS: false,
                isAndroid: false,
                isMobile: false,
                isTablet: false,
                isDesktop: true,
                hasTouchScreen: false,
                hasNotch: false,
                safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 }
            }
        }

        const platform = detectCapacitorPlatform()
        const isNative = detectIsNative()
        const hasTouchScreen = detectTouchScreen()
        const hasNotch = detectNotch()
        const safeAreaInsets = getSafeAreaInsets()

        return {
            platform,
            deviceType,
            isNative,
            isIOS: platform === 'ios',
            isAndroid: platform === 'android',
            isMobile: deviceType === 'mobile',
            isTablet: deviceType === 'tablet',
            isDesktop: deviceType === 'desktop',
            hasTouchScreen,
            hasNotch,
            safeAreaInsets
        }
    }, [mounted, deviceType])

    return platformInfo
}

// Static utility functions for non-hook usage
export const Platform = {
    isNative: detectIsNative,
    getPlatform: detectCapacitorPlatform,
    hasTouchScreen: detectTouchScreen,

    // Vibrate (works on Android and some browsers)
    vibrate: (pattern: number | number[] = 100) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try {
                navigator.vibrate(pattern)
            } catch {
                // Vibration not supported
            }
        }
    },

    // Haptic feedback patterns
    haptic: {
        light: () => Platform.vibrate(10),
        medium: () => Platform.vibrate(20),
        heavy: () => Platform.vibrate(30),
        success: () => Platform.vibrate([10, 50, 10]),
        warning: () => Platform.vibrate([30, 50, 30]),
        error: () => Platform.vibrate([50, 100, 50, 100, 50])
    }
}
