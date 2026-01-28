'use client'

import { useState, useEffect, useTransition, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addMeasurement, getMeasurements } from "@/actions/measurement-actions"
import { Loader2, Plus, ChevronDown, ChevronUp, TrendingUp, Scale, Percent, WifiOff, AlertCircle } from "lucide-react"
import { ProgressionChart } from "./progression-chart"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"

interface Measurement {
    id: string
    date: Date | string
    weight: number | null
    fatMass: number | null
    muscleMass: number | null
    notes?: string | null
}

export function ClientMeasurements({ clientId }: { clientId: string }) {
    const [measurements, setMeasurements] = useState<Measurement[]>([])
    const [showForm, setShowForm] = useState(false)
    const [showHistory, setShowHistory] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [isLoading, setIsLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)

    // Form state
    const [weight, setWeight] = useState("")
    const [fatMass, setFatMass] = useState("")
    const [muscleMass, setMuscleMass] = useState("")

    const fetchMeasurements = useCallback(async () => {
        setIsLoading(true)
        setLoadError(null)
        try {
            const data = await getMeasurements(clientId)
            setMeasurements(data)
        } catch (error) {
            console.error("Erreur lors du chargement des mesures:", error)
            setLoadError("Impossible de charger les mesures. Vérifiez votre connexion.")
            if (!navigator.onLine) {
                toast.error("Vous êtes hors ligne", {
                    description: "Vérifiez votre connexion internet"
                })
            } else {
                toast.error("Erreur de chargement des mesures")
            }
        } finally {
            setIsLoading(false)
        }
    }, [clientId])

    useEffect(() => {
        fetchMeasurements()
    }, [fetchMeasurements])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Vérifier qu'au moins une valeur est renseignée
        if (!weight && !fatMass && !muscleMass) {
            toast.error("Veuillez renseigner au moins une mesure")
            return
        }

        startTransition(async () => {
            try {
                const result = await addMeasurement({
                    clientId,
                    weight: weight.trim() ? parseFloat(weight) : null,
                    fatMass: fatMass.trim() ? parseFloat(fatMass) : null,
                    muscleMass: muscleMass.trim() ? parseFloat(muscleMass) : null,
                    date: new Date().toISOString().split('T')[0],
                })

                if (result.success) {
                    toast.success("Mesure enregistrée avec succès")
                    setShowForm(false)
                    setWeight("")
                    setFatMass("")
                    setMuscleMass("")
                    await fetchMeasurements()
                } else if (result.error) {
                    toast.error(result.error)
                }
            } catch (error) {
                console.error("Erreur lors de l'ajout de la mesure:", error)
                toast.error("Erreur lors de l'enregistrement")
            }
        })
    }

    // Dernière mesure
    const latestMeasurement = measurements[0]

    return (
        <div className="space-y-4">
            {/* Header avec bouton d'ajout */}
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Suivi Progression
                </h4>
                <Button
                    variant={showForm ? "secondary" : "default"}
                    size="sm"
                    onClick={() => setShowForm(!showForm)}
                    className="h-8 text-xs"
                >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    {showForm ? "Annuler" : "Nouvelle mesure"}
                </Button>
            </div>

            {/* Formulaire d'ajout */}
            {showForm && (
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-4 rounded-xl border border-primary/20 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-4" onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSubmit(e as any);
                        }
                    }}>
                        {/* Champs de mesure */}
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center gap-3 bg-white/50 dark:bg-black/20 p-3 rounded-lg border">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Scale className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <Label className="text-xs text-muted-foreground">Poids (optionnel)</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            step="0.1"
                                            placeholder="Ex: 75.5"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                            className="h-9 text-lg font-semibold"
                                        />
                                        <span className="text-sm text-muted-foreground font-medium">kg</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-amber-50/50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-200/50">
                                <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                                    <Percent className="h-5 w-5 text-amber-600" />
                                </div>
                                <div className="flex-1">
                                    <Label className="text-xs text-amber-700 dark:text-amber-400">Masse Grasse (optionnel)</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            step="0.1"
                                            placeholder="Ex: 18.5"
                                            value={fatMass}
                                            onChange={(e) => setFatMass(e.target.value)}
                                            className="h-9 text-lg font-semibold"
                                        />
                                        <span className="text-sm text-muted-foreground font-medium">%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-200/50">
                                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <Label className="text-xs text-blue-700 dark:text-blue-400">Masse Musculaire (optionnel)</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            step="0.1"
                                            placeholder="Ex: 42.0"
                                            value={muscleMass}
                                            onChange={(e) => setMuscleMass(e.target.value)}
                                            className="h-9 text-lg font-semibold"
                                        />
                                        <span className="text-sm text-muted-foreground font-medium">%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Date - auto-remplie avec aujourd'hui */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Date: <strong className="text-foreground">{format(new Date(), "d MMMM yyyy", { locale: fr })}</strong></span>
                            <span className="text-xs">(aujourd'hui)</span>
                        </div>

                        <Button
                            type="button"
                            size="sm"
                            className="w-full h-10"
                            disabled={isPending}
                            onClick={handleSubmit}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Enregistrement...
                                </>
                            ) : (
                                "Enregistrer la mesure"
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Dernières valeurs */}
            {latestMeasurement && !showForm && !isLoading && !loadError && (
                <div className="grid grid-cols-3 gap-2">
                    {latestMeasurement.weight && (
                        <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-3 text-center">
                            <Scale className="h-4 w-4 mx-auto mb-1 text-primary" />
                            <span className="text-lg font-bold text-primary">{latestMeasurement.weight}</span>
                            <span className="text-xs text-primary/70 ml-0.5">kg</span>
                        </div>
                    )}
                    {latestMeasurement.fatMass && (
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/10 dark:to-amber-900/20 border border-amber-200/50 rounded-xl p-3 text-center">
                            <Percent className="h-4 w-4 mx-auto mb-1 text-amber-600" />
                            <span className="text-lg font-bold text-amber-600">{latestMeasurement.fatMass}</span>
                            <span className="text-xs text-amber-600/70 ml-0.5">%</span>
                        </div>
                    )}
                    {latestMeasurement.muscleMass && (
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-900/20 border border-blue-200/50 rounded-xl p-3 text-center">
                            <svg className="h-4 w-4 mx-auto mb-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-lg font-bold text-blue-600">{latestMeasurement.muscleMass}</span>
                            <span className="text-xs text-blue-600/70 ml-0.5">%</span>
                        </div>
                    )}
                </div>
            )}

            {/* Graphique de progression */}
            {measurements.length > 0 && !isLoading && !loadError && (
                <div className="bg-card border rounded-xl p-4">
                    <ProgressionChart measurements={measurements} />
                </div>
            )}

            {/* Historique des mesures */}
            {measurements.length > 0 && !isLoading && !loadError && (
                <div className="border-t pt-3">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <span className="font-medium">Historique ({measurements.length} mesures)</span>
                        {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {showHistory && (
                        <div className="mt-3 space-y-2 max-h-[200px] overflow-y-auto animate-in fade-in slide-in-from-top-2">
                            {measurements.map((m) => (
                                <div
                                    key={m.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border text-sm hover:bg-muted/50 transition-colors"
                                >
                                    <span className="text-muted-foreground font-medium">
                                        {format(new Date(m.date), "d MMM yyyy", { locale: fr })}
                                    </span>
                                    <div className="flex gap-4 font-semibold">
                                        {m.weight && (
                                            <span className="text-primary">{m.weight} kg</span>
                                        )}
                                        {m.fatMass && (
                                            <span className="text-amber-600">MG: {m.fatMass}%</span>
                                        )}
                                        {m.muscleMass && (
                                            <span className="text-blue-600">MM: {m.muscleMass}%</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* État de chargement */}
            {isLoading && (
                <div className="text-center py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Chargement des mesures...</p>
                </div>
            )}

            {/* Erreur de chargement */}
            {loadError && !isLoading && (
                <div className="text-center py-6">
                    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
                        <WifiOff className="h-6 w-6 text-destructive" />
                    </div>
                    <p className="text-sm text-destructive">{loadError}</p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={fetchMeasurements}
                    >
                        Réessayer
                    </Button>
                </div>
            )}

            {/* Message si aucune mesure */}
            {measurements.length === 0 && !showForm && !isLoading && !loadError && (
                <div className="text-center py-6">
                    <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Aucune mesure enregistrée</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                        Cliquez sur "Nouvelle mesure" pour commencer le suivi
                    </p>
                </div>
            )}
        </div>
    )
}
