// ============================================
// UTILITAIRES DE DATES CENTRALISÉS
// ============================================

/**
 * Formate une date pour affichage long en français
 * Ex: "Mardi 12 Décembre"
 */
export function formatDisplayDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return ''

    const formatted = new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    }).format(d)

    // Capitalise la première lettre
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

/**
 * Formate une date pour affichage court en français
 * Ex: "12/01/2024"
 */
export function formatShortDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return ''

    return d.toLocaleDateString('fr-FR')
}

/**
 * Formate une date au format ISO (YYYY-MM-DD)
 */
export function toISODate(date: Date): string {
    return date.toISOString().split('T')[0]
}

/**
 * Parse une date au format DD/MM/YYYY ou YYYY-MM-DD
 */
export function parseDateString(dateStr: string): Date | null {
    if (!dateStr) return null

    // Format YYYY-MM-DD
    if (dateStr.includes('-') && dateStr.length === 10) {
        const date = new Date(dateStr)
        return isNaN(date.getTime()) ? null : date
    }

    // Format DD/MM/YYYY
    const parts = dateStr.split('/')
    if (parts.length === 3) {
        const [day, month, year] = parts
        const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
        return isNaN(date.getTime()) ? null : date
    }

    return null
}

/**
 * Formate une heure (ajoute le padding si nécessaire)
 * Ex: 9 -> "09:00", "9:30" -> "09:30"
 */
export function formatHour(hour: number | string): string {
    if (typeof hour === 'number') {
        return `${hour.toString().padStart(2, '0')}:00`
    }
    return hour
}

/**
 * Extrait l'heure et les minutes d'une date
 * Ex: Date -> "14:30"
 */
export function extractTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
}

/**
 * Combine une date et une heure en un seul objet Date
 */
export function combineDateAndTime(date: Date | string, time: string): Date {
    const d = typeof date === 'string' ? new Date(date) : new Date(date)
    const [hours, minutes] = time.split(':').map(Number)

    d.setHours(hours, minutes, 0, 0)
    return d
}

/**
 * Vérifie si une date est aujourd'hui
 */
export function isToday(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date
    const today = new Date()

    return d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
}

/**
 * Vérifie si une date est dans le passé
 */
export function isPast(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date
    return d < new Date()
}

/**
 * Obtient le début de la journée (00:00:00)
 */
export function startOfDay(date: Date): Date {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
}

/**
 * Obtient la fin de la journée (23:59:59)
 */
export function endOfDay(date: Date): Date {
    const d = new Date(date)
    d.setHours(23, 59, 59, 999)
    return d
}

/**
 * Ajoute des jours à une date
 */
export function addDays(date: Date, days: number): Date {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
}

/**
 * Obtient la date d'aujourd'hui au début de journée
 */
export function getToday(): Date {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
}
