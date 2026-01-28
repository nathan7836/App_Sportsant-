/**
 * Utilitaires pour la gestion des erreurs réseau
 */

// Types d'erreurs réseau
export type NetworkErrorType =
  | 'OFFLINE'
  | 'TIMEOUT'
  | 'SERVER_ERROR'
  | 'AUTH_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN'

export interface NetworkError {
  type: NetworkErrorType
  message: string
  originalError?: unknown
}

// Messages d'erreur en français
const ERROR_MESSAGES: Record<NetworkErrorType, string> = {
  OFFLINE: "Vous êtes hors ligne. Vérifiez votre connexion internet.",
  TIMEOUT: "La requête a pris trop de temps. Réessayez.",
  SERVER_ERROR: "Erreur serveur. Réessayez dans quelques instants.",
  AUTH_ERROR: "Session expirée. Veuillez vous reconnecter.",
  VALIDATION_ERROR: "Données invalides.",
  UNKNOWN: "Une erreur inattendue s'est produite."
}

/**
 * Vérifie si le navigateur est en ligne
 */
export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true
  return navigator.onLine
}

/**
 * Détermine le type d'erreur à partir d'une exception
 */
export function getErrorType(error: unknown): NetworkErrorType {
  if (!isOnline()) return 'OFFLINE'

  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (message.includes('timeout') || message.includes('aborted')) {
      return 'TIMEOUT'
    }

    if (message.includes('401') || message.includes('unauthorized') || message.includes('non autorisé')) {
      return 'AUTH_ERROR'
    }

    if (message.includes('500') || message.includes('server')) {
      return 'SERVER_ERROR'
    }

    if (message.includes('validation') || message.includes('invalid')) {
      return 'VALIDATION_ERROR'
    }
  }

  return 'UNKNOWN'
}

/**
 * Crée une erreur réseau formatée
 */
export function createNetworkError(error: unknown): NetworkError {
  const type = getErrorType(error)
  return {
    type,
    message: ERROR_MESSAGES[type],
    originalError: error
  }
}

/**
 * Obtient un message d'erreur utilisateur
 */
export function getErrorMessage(error: unknown): string {
  const networkError = createNetworkError(error)
  return networkError.message
}

/**
 * Type de retour standardisé pour les server actions
 */
export type ActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; errorType?: NetworkErrorType }

/**
 * Wrapper pour exécuter une server action avec gestion d'erreurs
 */
export async function executeAction<T>(
  action: () => Promise<T>,
  options?: {
    timeout?: number
    retries?: number
    onRetry?: (attempt: number) => void
  }
): Promise<ActionResult<T>> {
  const { timeout = 30000, retries = 0, onRetry } = options || {}

  // Vérifier la connexion
  if (!isOnline()) {
    return {
      success: false,
      error: ERROR_MESSAGES.OFFLINE,
      errorType: 'OFFLINE'
    }
  }

  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Créer un timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), timeout)
      })

      // Exécuter l'action avec timeout
      const result = await Promise.race([action(), timeoutPromise])

      return {
        success: true,
        data: result
      }
    } catch (error) {
      lastError = error

      if (attempt < retries) {
        onRetry?.(attempt + 1)
        // Attente exponentielle avant retry
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }

  const networkError = createNetworkError(lastError)
  return {
    success: false,
    error: networkError.message,
    errorType: networkError.type
  }
}

/**
 * Hook helper pour vérifier si une erreur est liée au réseau
 */
export function isNetworkError(errorType?: NetworkErrorType): boolean {
  return errorType === 'OFFLINE' || errorType === 'TIMEOUT' || errorType === 'SERVER_ERROR'
}
