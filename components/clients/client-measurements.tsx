'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addMeasurement, getMeasurements } from "@/actions/measurement-actions"
import { Loader2, Plus } from "lucide-react"
import { useActionState } from "react"

export function ClientMeasurements({ clientId }: { clientId: string }) {
    const [measurements, setMeasurements] = useState<any[]>([])
    const [showForm, setShowForm] = useState(false)
    const [state, formAction, isPending] = useActionState(addMeasurement, null)

    const fetchMeasurements = async () => {
        const data = await getMeasurements(clientId)
        setMeasurements(data)
    }

    useEffect(() => {
        fetchMeasurements()
    }, [clientId])

    useEffect(() => {
        if (state?.success) {
            setShowForm(false)
            fetchMeasurements() // Refresh list
        }
    }, [state])

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sm text-foreground">Historique Mesures</h4>
                <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
                    <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
            </div>

            {showForm && (
                <div className="bg-muted/30 p-3 rounded-lg border space-y-3 animate-in fade-in slide-in-from-top-2">
                    <form action={formAction} className="space-y-3">
                        <input type="hidden" name="clientId" value={clientId} />
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <Label className="text-xs">Poids (kg)</Label>
                                <Input name="weight" type="number" step="0.1" placeholder="0.0" className="h-8" />
                            </div>
                            <div>
                                <Label className="text-xs">Masse Grasse (%)</Label>
                                <Input name="fatMass" type="number" step="0.1" placeholder="%" className="h-8" />
                            </div>
                            <div>
                                <Label className="text-xs">Masse Musculaire (%)</Label>
                                <Input name="muscleMass" type="number" step="0.1" placeholder="%" className="h-8" />
                            </div>
                        </div>
                        <div>
                            <Label className="text-xs">Date</Label>
                            <Input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="h-8" />
                        </div>
                        <Button type="submit" size="sm" className="w-full" disabled={isPending}>
                            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Enregistrer"}
                        </Button>
                    </form>
                </div>
            )}

            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {measurements.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">Aucune mesure enregistrée.</p>
                ) : (
                    measurements.map((m) => (
                        <div key={m.id} className="flex items-center justify-between p-2 rounded-md bg-white border text-sm">
                            <span className="text-muted-foreground text-xs">{new Date(m.date).toLocaleDateString()}</span>
                            <div className="flex gap-3 font-medium">
                                {m.weight && <span>{m.weight} kg</span>}
                                {m.fatMass && <span className="text-amber-600">MG: {m.fatMass}%</span>}
                                {m.muscleMass && <span className="text-blue-600">MM: {m.muscleMass}%</span>}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
