// ============================================
// CONSTANTES CENTRALISÉES DE L'APPLICATION
// ============================================

// Statuts des séances
export const SESSION_STATUS = {
    PLANNED: 'PLANNED',
    CONFIRMED: 'CONFIRMED',
    DONE: 'DONE',
    CANCELLED: 'CANCELLED',
} as const

export type SessionStatus = typeof SESSION_STATUS[keyof typeof SESSION_STATUS]

export const SESSION_STATUS_CONFIG = {
    PLANNED: {
        label: 'Planifiée',
        style: 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200',
        badgeStyle: 'bg-blue-100 text-blue-700',
        dotColor: 'bg-blue-100 border-blue-200',
    },
    CONFIRMED: {
        label: 'Confirmée',
        style: 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200',
        badgeStyle: 'bg-emerald-500 text-white',
        dotColor: 'bg-emerald-500 border-emerald-600',
    },
    DONE: {
        label: 'Effectuée',
        style: 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200',
        badgeStyle: 'bg-blue-500 text-white',
        dotColor: 'bg-green-500 border-green-600',
    },
    CANCELLED: {
        label: 'Annulée',
        style: 'bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200',
        badgeStyle: 'bg-rose-100 text-rose-700',
        dotColor: 'bg-rose-100 border-rose-200',
    },
} as const

// Helper pour obtenir le style d'un statut
export function getStatusStyle(status: string): string {
    return SESSION_STATUS_CONFIG[status as SessionStatus]?.badgeStyle ?? SESSION_STATUS_CONFIG.PLANNED.badgeStyle
}

// Helper pour obtenir le label d'un statut
export function getStatusLabel(status: string): string {
    return SESSION_STATUS_CONFIG[status as SessionStatus]?.label ?? SESSION_STATUS_CONFIG.PLANNED.label
}

// Créneaux horaires standards
export const TIME_SLOTS = [
    { label: "8h", value: "08:00" },
    { label: "9h", value: "09:00" },
    { label: "10h", value: "10:00" },
    { label: "11h", value: "11:00" },
    { label: "12h", value: "12:00" },
    { label: "14h", value: "14:00" },
    { label: "15h", value: "15:00" },
    { label: "16h", value: "16:00" },
    { label: "17h", value: "17:00" },
    { label: "18h", value: "18:00" },
    { label: "19h", value: "19:00" },
    { label: "20h", value: "20:00" },
] as const

// Jours de la semaine (pour la récurrence)
export const DAYS_OF_WEEK = [
    { key: 'monday', label: 'Lun', fullLabel: 'Lundi' },
    { key: 'tuesday', label: 'Mar', fullLabel: 'Mardi' },
    { key: 'wednesday', label: 'Mer', fullLabel: 'Mercredi' },
    { key: 'thursday', label: 'Jeu', fullLabel: 'Jeudi' },
    { key: 'friday', label: 'Ven', fullLabel: 'Vendredi' },
    { key: 'saturday', label: 'Sam', fullLabel: 'Samedi' },
    { key: 'sunday', label: 'Dim', fullLabel: 'Dimanche' },
] as const

// Regex de validation
export const VALIDATION_PATTERNS = {
    TIME: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    PHONE_FR: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const

// Messages d'erreur standardisés
export const ERROR_MESSAGES = {
    UNAUTHORIZED: "Non autorisé",
    MISSING_ID: "ID manquant",
    INVALID_DATE: "Date invalide",
    INVALID_TIME: "Heure invalide",
    REQUIRED_FIELDS: "Tous les champs obligatoires doivent être remplis",
    CREATE_ERROR: "Erreur lors de la création",
    UPDATE_ERROR: "Erreur lors de la modification",
    DELETE_ERROR: "Erreur lors de la suppression",
} as const

// Messages de succès standardisés
export const SUCCESS_MESSAGES = {
    CREATED: "Créé avec succès",
    UPDATED: "Mis à jour avec succès",
    DELETED: "Supprimé avec succès",
    SESSION_CREATED: "Séance planifiée avec succès",
    SESSION_UPDATED: "Séance mise à jour",
    SESSION_DELETED: "Séance supprimée",
} as const

// Styles de cartes harmonisés
export const CARD_STYLES = {
    default: "border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200",
    interactive: "border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer",
    elevated: "border-border/40 shadow-md hover:shadow-xl transition-shadow duration-200",
} as const

// Tailles de touch targets (minimum 44px pour accessibilité)
export const TOUCH_TARGET = {
    sm: "min-h-[44px] min-w-[44px]",
    md: "min-h-[48px] min-w-[48px]",
    lg: "min-h-[56px] min-w-[56px]",
} as const
