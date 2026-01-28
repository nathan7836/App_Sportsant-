'use client'

import { useMemo } from "react"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Area,
    ComposedChart
} from "recharts"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Measurement {
    id: string
    date: Date | string
    weight: number | null
    fatMass: number | null
    muscleMass: number | null
}

interface ProgressionChartProps {
    measurements: Measurement[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow-lg">
                <p className="font-semibold text-sm mb-2 text-foreground">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-muted-foreground">{entry.name}:</span>
                        <span className="font-semibold" style={{ color: entry.color }}>
                            {entry.value}{entry.name === "Poids" ? " kg" : " %"}
                        </span>
                    </div>
                ))}
            </div>
        )
    }
    return null
}

export function ProgressionChart({ measurements }: ProgressionChartProps) {
    const chartData = useMemo(() => {
        if (!measurements || measurements.length === 0) return []

        // Trier par date croissante pour le graphique
        const sorted = [...measurements].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )

        return sorted.map((m) => ({
            date: format(new Date(m.date), "d MMM", { locale: fr }),
            fullDate: format(new Date(m.date), "d MMMM yyyy", { locale: fr }),
            Poids: m.weight,
            "Masse Grasse": m.fatMass,
            "Masse Musculaire": m.muscleMass,
        }))
    }, [measurements])

    // Calculer les statistiques de progression
    const stats = useMemo(() => {
        if (chartData.length < 2) return null

        const first = measurements[measurements.length - 1] // Plus ancienne
        const last = measurements[0] // Plus récente

        const weightDiff = last.weight && first.weight
            ? (last.weight - first.weight).toFixed(1)
            : null
        const fatDiff = last.fatMass && first.fatMass
            ? (last.fatMass - first.fatMass).toFixed(1)
            : null
        const muscleDiff = last.muscleMass && first.muscleMass
            ? (last.muscleMass - first.muscleMass).toFixed(1)
            : null

        return { weightDiff, fatDiff, muscleDiff }
    }, [chartData, measurements])

    if (chartData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <p className="text-sm text-muted-foreground">Aucune donnée de progression</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Ajoutez des mesures pour voir la courbe</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Stats de progression */}
            {stats && (
                <div className="grid grid-cols-3 gap-2">
                    {stats.weightDiff !== null && (
                        <div className="bg-muted/30 rounded-lg p-2 text-center">
                            <span className="text-xs text-muted-foreground block">Poids</span>
                            <span className={`font-bold text-sm ${
                                parseFloat(stats.weightDiff) < 0 ? "text-green-600" : parseFloat(stats.weightDiff) > 0 ? "text-amber-600" : "text-foreground"
                            }`}>
                                {parseFloat(stats.weightDiff) > 0 ? "+" : ""}{stats.weightDiff} kg
                            </span>
                        </div>
                    )}
                    {stats.fatDiff !== null && (
                        <div className="bg-muted/30 rounded-lg p-2 text-center">
                            <span className="text-xs text-muted-foreground block">M. Grasse</span>
                            <span className={`font-bold text-sm ${
                                parseFloat(stats.fatDiff) < 0 ? "text-green-600" : parseFloat(stats.fatDiff) > 0 ? "text-red-500" : "text-foreground"
                            }`}>
                                {parseFloat(stats.fatDiff) > 0 ? "+" : ""}{stats.fatDiff}%
                            </span>
                        </div>
                    )}
                    {stats.muscleDiff !== null && (
                        <div className="bg-muted/30 rounded-lg p-2 text-center">
                            <span className="text-xs text-muted-foreground block">M. Musculaire</span>
                            <span className={`font-bold text-sm ${
                                parseFloat(stats.muscleDiff) > 0 ? "text-green-600" : parseFloat(stats.muscleDiff) < 0 ? "text-red-500" : "text-foreground"
                            }`}>
                                {parseFloat(stats.muscleDiff) > 0 ? "+" : ""}{stats.muscleDiff}%
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Graphique */}
            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="oklch(0.52 0.26 285)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="oklch(0.52 0.26 285)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorMuscle" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.8 0.01 270 / 0.3)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: 'oklch(0.5 0.02 270)' }}
                            axisLine={{ stroke: 'oklch(0.8 0.01 270 / 0.5)' }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: 'oklch(0.5 0.02 270)' }}
                            axisLine={false}
                            tickLine={false}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                            iconType="circle"
                            iconSize={8}
                        />
                        {chartData.some(d => d.Poids !== null) && (
                            <>
                                <Area
                                    type="monotone"
                                    dataKey="Poids"
                                    stroke="oklch(0.52 0.26 285)"
                                    fill="url(#colorWeight)"
                                    strokeWidth={0}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Poids"
                                    stroke="oklch(0.52 0.26 285)"
                                    strokeWidth={2.5}
                                    dot={{ r: 4, fill: "oklch(0.52 0.26 285)", strokeWidth: 2, stroke: "#fff" }}
                                    activeDot={{ r: 6, fill: "oklch(0.52 0.26 285)", strokeWidth: 2, stroke: "#fff" }}
                                    connectNulls
                                />
                            </>
                        )}
                        {chartData.some(d => d["Masse Grasse"] !== null) && (
                            <>
                                <Area
                                    type="monotone"
                                    dataKey="Masse Grasse"
                                    stroke="#f59e0b"
                                    fill="url(#colorFat)"
                                    strokeWidth={0}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Masse Grasse"
                                    stroke="#f59e0b"
                                    strokeWidth={2.5}
                                    dot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }}
                                    activeDot={{ r: 6, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }}
                                    connectNulls
                                />
                            </>
                        )}
                        {chartData.some(d => d["Masse Musculaire"] !== null) && (
                            <>
                                <Area
                                    type="monotone"
                                    dataKey="Masse Musculaire"
                                    stroke="#3b82f6"
                                    fill="url(#colorMuscle)"
                                    strokeWidth={0}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Masse Musculaire"
                                    stroke="#3b82f6"
                                    strokeWidth={2.5}
                                    dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
                                    activeDot={{ r: 6, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
                                    connectNulls
                                />
                            </>
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
