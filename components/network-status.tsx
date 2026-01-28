'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)
  const toastIdRef = useRef<string | number | null>(null)
  const mountedRef = useRef(true)

  const handleOnline = useCallback(() => {
    if (!mountedRef.current) return

    setIsOnline(true)

    // Fermer le toast "hors ligne" s'il existe
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current)
      toastIdRef.current = null
    }

    // Si on était hors ligne avant, afficher le toast de reconnexion
    if (wasOffline) {
      toast.success("Connexion rétablie", {
        description: "Vous êtes de nouveau en ligne",
        duration: 3000,
      })
      setWasOffline(false)
    }
  }, [wasOffline])

  const handleOffline = useCallback(() => {
    if (!mountedRef.current) return

    setIsOnline(false)
    setWasOffline(true)

    // Afficher un toast persistant pour hors ligne
    toastIdRef.current = toast.error("Vous êtes hors ligne", {
      description: "Certaines fonctionnalités peuvent ne pas être disponibles",
      duration: Infinity, // Reste jusqu'à ce qu'on soit en ligne
      id: 'offline-toast', // ID unique pour éviter les doublons
    })
  }, [])

  useEffect(() => {
    mountedRef.current = true

    // Vérifier l'état initial
    if (typeof navigator !== 'undefined') {
      const online = navigator.onLine
      setIsOnline(online)

      if (!online) {
        handleOffline()
      }
    }

    // Écouter les changements
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      mountedRef.current = false
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)

      // Nettoyer le toast au démontage
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current)
      }
    }
  }, [handleOnline, handleOffline])

  // Ce composant ne rend rien visuellement, il gère juste les toasts
  return null
}

// Hook pour utiliser le statut réseau dans d'autres composants
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine)
    }

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
