'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'

interface SafeAreaInsets {
  top: number
  bottom: number
  left: number
  right: number
}

interface SafeAreaContextType {
  insets: SafeAreaInsets
  isReady: boolean
  platform: 'ios' | 'android' | 'web'
  hasNotch: boolean
  isLandscape: boolean
  keyboardVisible: boolean
  keyboardHeight: number
}

const defaultInsets: SafeAreaInsets = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
}

const SafeAreaContext = createContext<SafeAreaContextType>({
  insets: defaultInsets,
  isReady: false,
  platform: 'web',
  hasNotch: false,
  isLandscape: false,
  keyboardVisible: false,
  keyboardHeight: 0,
})

export function useSafeArea() {
  return useContext(SafeAreaContext)
}

// Detect platform
function detectPlatform(): 'ios' | 'android' | 'web' {
  if (typeof window === 'undefined') return 'web'

  const capacitor = (window as any).Capacitor
  if (capacitor?.isNativePlatform?.()) {
    return capacitor.getPlatform?.() === 'ios' ? 'ios' : 'android'
  }

  const ua = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(ua)) return 'ios'
  if (/android/.test(ua)) return 'android'

  return 'web'
}

// Check for notch/dynamic island
function detectNotch(): boolean {
  if (typeof window === 'undefined') return false

  // Check if safe-area-inset-top is significant (> 20px typically means notch)
  const testEl = document.createElement('div')
  testEl.style.paddingTop = 'env(safe-area-inset-top, 0px)'
  document.body.appendChild(testEl)
  const computed = getComputedStyle(testEl)
  const topInset = parseInt(computed.paddingTop) || 0
  document.body.removeChild(testEl)

  return topInset > 20
}

// Get computed safe area insets
function getSafeAreaInsets(): SafeAreaInsets {
  if (typeof window === 'undefined') return defaultInsets

  const testEl = document.createElement('div')
  testEl.style.cssText = `
    position: fixed;
    padding-top: env(safe-area-inset-top, 0px);
    padding-bottom: env(safe-area-inset-bottom, 0px);
    padding-left: env(safe-area-inset-left, 0px);
    padding-right: env(safe-area-inset-right, 0px);
    pointer-events: none;
    visibility: hidden;
  `
  document.body.appendChild(testEl)

  const computed = getComputedStyle(testEl)
  const insets = {
    top: parseInt(computed.paddingTop) || 0,
    bottom: parseInt(computed.paddingBottom) || 0,
    left: parseInt(computed.paddingLeft) || 0,
    right: parseInt(computed.paddingRight) || 0,
  }

  document.body.removeChild(testEl)
  return insets
}

export function SafeAreaProvider({ children }: { children: ReactNode }) {
  const [insets, setInsets] = useState<SafeAreaInsets>(defaultInsets)
  const [isReady, setIsReady] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web')
  const [hasNotch, setHasNotch] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  // Update CSS variables
  const updateCSSVariables = useCallback((newInsets: SafeAreaInsets) => {
    const root = document.documentElement
    root.style.setProperty('--safe-area-top', `${newInsets.top}px`)
    root.style.setProperty('--safe-area-bottom', `${newInsets.bottom}px`)
    root.style.setProperty('--safe-area-left', `${newInsets.left}px`)
    root.style.setProperty('--safe-area-right', `${newInsets.right}px`)

    // Also set combined values for common use cases
    root.style.setProperty('--header-height', `calc(56px + ${newInsets.top}px)`)
    root.style.setProperty('--bottom-nav-height', `calc(64px + ${newInsets.bottom}px)`)
    root.style.setProperty('--content-padding-top', `${newInsets.top + 16}px`)
    root.style.setProperty('--content-padding-bottom', `calc(80px + ${newInsets.bottom}px)`)
  }, [])

  // Measure and update insets
  const measureInsets = useCallback(() => {
    const newInsets = getSafeAreaInsets()
    setInsets(newInsets)
    updateCSSVariables(newInsets)
  }, [updateCSSVariables])

  // Handle orientation change
  const handleOrientationChange = useCallback(() => {
    const isLandscapeNow = window.innerWidth > window.innerHeight
    setIsLandscape(isLandscapeNow)
    document.body.classList.toggle('landscape', isLandscapeNow)

    // Re-measure after orientation change
    setTimeout(measureInsets, 100)
  }, [measureInsets])

  // Handle keyboard events (Capacitor)
  const setupKeyboardListeners = useCallback(() => {
    const capacitor = (window as any).Capacitor
    if (!capacitor?.isNativePlatform?.()) return

    // Try to use Capacitor Keyboard plugin
    import('@capacitor/keyboard').then(({ Keyboard }) => {
      Keyboard.addListener('keyboardWillShow', (info) => {
        setKeyboardVisible(true)
        setKeyboardHeight(info.keyboardHeight)
        document.body.classList.add('keyboard-visible')
        document.documentElement.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`)
      })

      Keyboard.addListener('keyboardWillHide', () => {
        setKeyboardVisible(false)
        setKeyboardHeight(0)
        document.body.classList.remove('keyboard-visible')
        document.documentElement.style.setProperty('--keyboard-height', '0px')
      })
    }).catch(() => {
      // Keyboard plugin not available, use fallback
      console.log('[SafeArea] Keyboard plugin not available')
    })
  }, [])

  // Initialize
  useEffect(() => {
    // Detect platform
    const detectedPlatform = detectPlatform()
    setPlatform(detectedPlatform)
    document.body.classList.add(`platform-${detectedPlatform}`)

    // Detect notch
    const hasNotchDevice = detectNotch()
    setHasNotch(hasNotchDevice)
    if (hasNotchDevice) {
      document.body.classList.add('has-notch')
    }

    // Initial measurement
    measureInsets()
    setIsReady(true)

    // Check initial orientation
    handleOrientationChange()

    // Setup keyboard listeners
    setupKeyboardListeners()

    // Listen for resize/orientation changes
    window.addEventListener('resize', handleOrientationChange)
    window.addEventListener('orientationchange', handleOrientationChange)

    // Re-measure on focus (app returning from background)
    const handleFocus = () => {
      setTimeout(measureInsets, 100)
    }
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        setTimeout(measureInsets, 100)
      }
    })

    return () => {
      window.removeEventListener('resize', handleOrientationChange)
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [measureInsets, handleOrientationChange, setupKeyboardListeners])

  return (
    <SafeAreaContext.Provider
      value={{
        insets,
        isReady,
        platform,
        hasNotch,
        isLandscape,
        keyboardVisible,
        keyboardHeight,
      }}
    >
      {children}
    </SafeAreaContext.Provider>
  )
}

// Utility component for safe area spacing
export function SafeAreaTop({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-full ${className}`}
      style={{ height: 'var(--safe-area-top, env(safe-area-inset-top, 0px))' }}
    />
  )
}

export function SafeAreaBottom({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-full ${className}`}
      style={{ height: 'var(--safe-area-bottom, env(safe-area-inset-bottom, 0px))' }}
    />
  )
}

// HOC for pages that need safe area padding
export function withSafeArea<P extends object>(
  Component: React.ComponentType<P>,
  options: { top?: boolean; bottom?: boolean; left?: boolean; right?: boolean } = {}
) {
  const { top = true, bottom = true, left = true, right = true } = options

  return function WithSafeAreaWrapper(props: P) {
    return (
      <div
        style={{
          paddingTop: top ? 'var(--safe-area-top, env(safe-area-inset-top, 0px))' : undefined,
          paddingBottom: bottom ? 'var(--safe-area-bottom, env(safe-area-inset-bottom, 0px))' : undefined,
          paddingLeft: left ? 'var(--safe-area-left, env(safe-area-inset-left, 0px))' : undefined,
          paddingRight: right ? 'var(--safe-area-right, env(safe-area-inset-right, 0px))' : undefined,
        }}
      >
        <Component {...props} />
      </div>
    )
  }
}
