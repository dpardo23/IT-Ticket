'use client'

import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
    BrainCircuit,
    Gauge,
    Layers,
    CheckCircle2,
    AlertTriangle,
    BarChart3,
    Cpu,
    Loader2,
    Send,
    Thermometer,
    FileText,
    Wand2,
} from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import type { SingleInferenceResult, BatchInferenceResult } from '@/types/ai'

interface ReasoningPanelProps {
    activeTab: 'manual' | 'batch'
    manualResult: SingleInferenceResult | null
    batchResult: BatchInferenceResult | null
    isProcessing: boolean
    onFeedback: (originalText: string, correctDepartment: string) => void
}

function SkeletonBlock({ className }: { className: string }) {
    return <div className={`animate-pulse rounded-xl bg-muted/60 ${className}`} />
}

function safeNumber(n: any): number | null {
    const num = Number(n)
    if (Number.isNaN(num) || !Number.isFinite(num)) return null
    return num
}

function Heatmap({ matrix, labels }: { matrix: number[][]; labels: string[] }) {
    const maxValue = useMemo(() => {
        let max = 0
        for (const row of matrix) {
            for (const val of row) max = Math.max(max, val)
        }
        return max
    }, [matrix])

    return (
        <div className="overflow-auto max-h-[320px] rounded-xl border border-border">
            <div className="min-w-[640px]">
                <div
                    className="grid"
                    style={{
                        gridTemplateColumns: `180px repeat(${labels.length}, 1fr)`,
                    }}
                >
                    <div className="p-2 text-[11px] font-semibold text-muted-foreground border-b border-border bg-background/70 sticky top-0 backdrop-blur">
                        Real \ Pred
                    </div>

                    {labels.map((l) => (
                        <div
                            key={l}
                            className="p-2 text-[11px] font-semibold text-muted-foreground border-b border-border bg-background/70 sticky top-0 backdrop-blur"
                        >
                            {l}
                        </div>
                    ))}

                    {matrix.map((row, i) => (
                        <React.Fragment key={i}>
                            <div className="p-2 text-[11px] font-semibold border-b border-border bg-muted/30">
                                {labels[i]}
                            </div>

                            {row.map((val, j) => {
                                const intensity = maxValue > 0 ? val / maxValue : 0
                                return (
                                    <div
                                        key={j}
                                        className="p-2 border-b border-border text-[11px] font-semibold text-center relative"
                                        style={{
                                            background: `rgba(239,68,68,${0.12 + intensity * 0.55})`,
                                        }}
                                    >
                                        <span className="relative z-10 text-white drop-shadow-sm">
                                            {val}
                                        </span>
                                    </div>
                                )
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    )
}

export function ReasoningPanel({
    activeTab,
    manualResult,
    batchResult,
    isProcessing,
    onFeedback,
}: ReasoningPanelProps) {
    const [feedbackDept, setFeedbackDept] = useState('')

    // Texto original real = title+description (si backend no manda, usamos tokens como fallback)
    const originalText = useMemo(() => {
        if (!manualResult) return ''
        if (manualResult.originalText) return manualResult.originalText
        if (manualResult.tokens?.length) return manualResult.tokens.join(' ')
        return ''
    }, [manualResult])

    const cleanText = useMemo(() => {
        if (!manualResult) return null
        return manualResult.cleanText ?? null
    }, [manualResult])

    // Probabilidades reales y seguras
    const sortedProbs = useMemo(() => {
        if (!manualResult?.probabilities) return []

        const cleaned = Object.entries(manualResult.probabilities)
            .map(([k, v]) => [k, safeNumber(v)] as [string, number | null])
            .filter(([, v]) => v !== null)
            .map(([k, v]) => [k, v as number] as [string, number])
            .sort((a, b) => b[1] - a[1])

        return cleaned
    }, [manualResult])

    const winnerScore = useMemo(() => {
        if (!manualResult?.winner) return null
        if (!sortedProbs.length) return null

        const found = sortedProbs.find(([label]) => label === manualResult.winner)
        if (!found) return null

        return found[1]
    }, [manualResult, sortedProbs])

    const confidenceLabel = useMemo(() => {
        if (winnerScore === null) return 'Sin datos'
        if (winnerScore >= 0.75) return 'Alta confianza'
        if (winnerScore >= 0.5) return 'Confianza media'
        return 'Baja confianza'
    }, [winnerScore])

    const handleSendFeedback = () => {
        if (!feedbackDept.trim()) return
        if (!originalText.trim()) return

        onFeedback(originalText, feedbackDept.trim())
        setFeedbackDept('')
    }

    // Batch helpers
    const distributionSorted = useMemo(() => {
        if (!batchResult?.departmentDistribution) return []
        return Object.entries(batchResult.departmentDistribution).sort((a, b) => b[1] - a[1])
    }, [batchResult])

    const totalDist = useMemo(() => {
        if (!batchResult?.departmentDistribution) return 0
        return Object.values(batchResult.departmentDistribution).reduce((a, b) => a + b, 0)
    }, [batchResult])

    const maxDist = useMemo(() => {
        if (!distributionSorted.length) return 0
        return distributionSorted[0][1]
    }, [distributionSorted])

    return (
        <Card className="h-full rounded-2xl border-border bg-card/70 backdrop-blur-md shadow-xl overflow-hidden flex flex-col">
            {/* HEADER */}
            <div className="h-[45px] px-4 flex items-center justify-between bg-gradient-to-r from-red-600 to-red-500 text-white">
                <div className="flex items-center gap-2 font-semibold tracking-tight">
                    <BrainCircuit size={16} />
                    <span className="text-sm">
                        {activeTab === 'manual'
                            ? 'Manual Reasoning (Pipeline NLP)'
                            : 'Batch Audit'}
                    </span>
                </div>

                {isProcessing && (
                    <span className="text-[11px] flex items-center gap-2 text-white/90">
                        <Loader2 size={13} className="animate-spin" />
                        Ejecutando...
                    </span>
                )}
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* ===================== */}
                {/* MANUAL */}
                {/* ===================== */}
                {activeTab === 'manual' && (
                    <>
                        {isProcessing && !manualResult && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <SkeletonBlock className="h-[92px]" />
                                    <SkeletonBlock className="h-[92px]" />
                                </div>
                                <SkeletonBlock className="h-[180px]" />
                                <SkeletonBlock className="h-[150px]" />
                            </div>
                        )}

                        {!isProcessing && !manualResult && (
                            <div className="text-sm text-muted-foreground flex flex-col gap-2 p-4 rounded-xl border border-border bg-muted/30">
                                <div className="flex items-center gap-2 font-semibold text-foreground">
                                    <Cpu size={16} className="text-red-500" />
                                    Motor IA listo
                                </div>
                                <span className="text-xs leading-relaxed">
                                    Ejecuta un análisis manual para visualizar el Pipeline NLP,
                                    predicción, probabilidades reales y feedback humano.
                                </span>
                            </div>
                        )}

                        {manualResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25 }}
                                className="space-y-4"
                            >
                                {/* RESULT SUMMARY */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-border bg-card/80 p-3 flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <CheckCircle2 size={14} className="text-green-500" />
                                            Predicción Final
                                        </div>

                                        <div className="text-lg font-bold text-foreground tracking-tight">
                                            {manualResult.winner}
                                        </div>

                                        <div className="text-[11px] text-muted-foreground">
                                            {winnerScore !== null ? (
                                                <>
                                                    {confidenceLabel} • Score:{' '}
                                                    <span className="font-semibold">
                                                        {(winnerScore * 100).toFixed(1)}%
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-red-500 font-semibold">
                                                    Backend no envió probabilidades válidas
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-[11px] text-muted-foreground">
                                            Nivel:{' '}
                                            <span className="font-semibold">
                                                {manualResult.level || 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-border bg-card/80 p-3 flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Gauge size={14} className="text-red-500" />
                                            Latencia
                                        </div>
                                        <div className="text-lg font-bold text-foreground tracking-tight">
                                            {manualResult.latency} ms
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">
                                            Inferencia única (online)
                                        </div>
                                    </div>
                                </div>

                                {/* NLP PREPROCESS */}
                                <div className="rounded-xl border border-border bg-card/80 p-3">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                        <Wand2 size={14} className="text-red-500" />
                                        Preprocesamiento (NLP)
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-xl border border-border bg-muted/20 p-3">
                                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
                                                <FileText size={12} />
                                                Texto Original
                                            </div>

                                            <div className="text-[12px] leading-relaxed whitespace-pre-wrap">
                                                {manualResult.originalText ? (
                                                    manualResult.originalText
                                                ) : (
                                                    <span className="text-red-500 font-semibold">
                                                        (No disponible - backend no envió originalText)
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-border bg-muted/20 p-3">
                                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
                                                <Wand2 size={12} />
                                                Texto Limpio
                                            </div>

                                            <div className="text-[12px] leading-relaxed whitespace-pre-wrap">
                                                {cleanText ? (
                                                    cleanText
                                                ) : (
                                                    <span className="text-red-500 font-semibold">
                                                        (No disponible - backend no envió cleanText)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* TOKENS */}
                                <div className="rounded-xl border border-border bg-card/80 p-3">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                        <Layers size={14} className="text-red-500" />
                                        Tokens NLP (Lematizados)
                                    </div>

                                    {manualResult.tokens?.length ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {manualResult.tokens.slice(0, 80).map((t, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 text-[11px] rounded-full bg-muted/60 border border-border"
                                                >
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-[12px] text-red-500 font-semibold">
                                            Backend no envió tokens.
                                        </div>
                                    )}
                                </div>

                                {/* TOP TF-IDF */}
                                <div className="rounded-xl border border-border bg-card/80 p-3">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                        <BarChart3 size={14} className="text-red-500" />
                                        Features relevantes (Top TF-IDF)
                                    </div>

                                    {manualResult.topTfidf?.length ? (
                                        <div className="space-y-2">
                                            {manualResult.topTfidf.slice(0, 10).map((x, i) => (
                                                <div key={i} className="flex justify-between text-[12px]">
                                                    <span className="font-semibold">{x.term}</span>
                                                    <span className="text-muted-foreground">
                                                        {safeNumber(x.weight) !== null
                                                            ? safeNumber(x.weight)!.toFixed(4)
                                                            : 'N/A'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-[12px] text-red-500 font-semibold">
                                            Backend no envió topTfidf (no se puede mostrar TF-IDF real).
                                        </div>
                                    )}
                                </div>

                                {/* PROBABILITIES */}
                                <div className="rounded-xl border border-border bg-card/80 p-3">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                        <Thermometer size={14} className="text-red-500" />
                                        Confianza del Modelo (Probabilidades)
                                    </div>

                                    {sortedProbs.length ? (
                                        <div className="space-y-2">
                                            {sortedProbs.slice(0, 6).map(([label, prob]) => (
                                                <div key={label} className="space-y-1">
                                                    <div className="flex justify-between text-[11px]">
                                                        <span className="font-semibold truncate max-w-[70%]">
                                                            {label}
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                            {(prob * 100).toFixed(1)}%
                                                        </span>
                                                    </div>

                                                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all"
                                                            style={{ width: `${Math.min(prob * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-[12px] text-red-500 font-semibold">
                                            No se recibieron probabilidades desde backend.
                                        </div>
                                    )}
                                </div>

                                {/* FEEDBACK */}
                                <div className="rounded-xl border border-border bg-card/80 p-3">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                        <Send size={14} className="text-green-500" />
                                        Feedback / Aprendizaje
                                    </div>

                                    <div className="text-[11px] text-muted-foreground mb-2">
                                        Introduce el departamento correcto. Se aceptan sinónimos como:{' '}
                                        <b>Redes</b>, <b>Seguridad</b>, <b>Soporte</b>, <b>Servidores</b>.
                                    </div>

                                    <div className="flex gap-2">
                                        <Input
                                            value={feedbackDept}
                                            onChange={(e) => setFeedbackDept(e.target.value)}
                                            placeholder="Ej: Redes / Seguridad / Soporte"
                                            className="h-9 rounded-xl"
                                            disabled={isProcessing}
                                        />

                                        <Button
                                            onClick={handleSendFeedback}
                                            disabled={isProcessing || feedbackDept.trim().length < 2}
                                            className="h-9 rounded-xl bg-green-600 hover:bg-green-500 text-white"
                                        >
                                            Enviar
                                        </Button>
                                    </div>

                                    <div className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                                        El feedback refuerza el modelo incremental (SGD partial_fit). Al alcanzar umbral se ejecuta
                                        reentrenamiento batch automático.
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}

                {/* ===================== */}
                {/* BATCH */}
                {/* ===================== */}
                {activeTab === 'batch' && (
                    <>
                        {isProcessing && !batchResult && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-3 gap-3">
                                    <SkeletonBlock className="h-[80px]" />
                                    <SkeletonBlock className="h-[80px]" />
                                    <SkeletonBlock className="h-[80px]" />
                                </div>
                                <SkeletonBlock className="h-[140px]" />
                                <SkeletonBlock className="h-[240px]" />
                            </div>
                        )}

                        {!isProcessing && !batchResult && (
                            <div className="text-sm text-muted-foreground flex flex-col gap-2 p-4 rounded-xl border border-border bg-muted/30">
                                <div className="flex items-center gap-2 font-semibold text-foreground">
                                    <AlertTriangle size={16} className="text-red-500" />
                                    Auditoría Batch vacía
                                </div>
                                <span className="text-xs leading-relaxed">
                                    Sube un CSV para ejecutar clasificación masiva y visualizar métricas reales.
                                </span>
                            </div>
                        )}

                        {batchResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25 }}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="rounded-xl border border-border bg-card/80 p-3">
                                        <div className="text-[11px] text-muted-foreground">F1-Score</div>
                                        <div className="text-lg font-bold">{batchResult.f1Score.toFixed(3)}</div>
                                    </div>

                                    <div className="rounded-xl border border-border bg-card/80 p-3">
                                        <div className="text-[11px] text-muted-foreground">Accuracy</div>
                                        <div className="text-lg font-bold">{batchResult.accuracy.toFixed(3)}</div>
                                    </div>

                                    <div className="rounded-xl border border-border bg-card/80 p-3">
                                        <div className="text-[11px] text-muted-foreground">Modelo</div>
                                        <div className="text-sm font-bold truncate">{batchResult.bestModelName}</div>
                                        <div className="text-[11px] text-muted-foreground">
                                            Alpha: {batchResult.optimalAlpha ?? 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {/* DISTRIBUTION */}
                                {batchResult.departmentDistribution && (
                                    <div className="rounded-xl border border-border bg-card/80 p-3">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                            <BarChart3 size={14} className="text-red-500" />
                                            Distribución Departamentos (Top 10)
                                        </div>

                                        <div className="space-y-2">
                                            {distributionSorted.slice(0, 10).map(([dep, count]) => {
                                                const percent = totalDist > 0 ? (count / totalDist) * 100 : 0
                                                const width = maxDist > 0 ? (count / maxDist) * 100 : 0

                                                return (
                                                    <div key={dep} className="space-y-1">
                                                        <div className="flex justify-between text-[11px]">
                                                            <span className="font-semibold truncate max-w-[70%]">{dep}</span>
                                                            <span className="text-muted-foreground">
                                                                {count} ({percent.toFixed(1)}%)
                                                            </span>
                                                        </div>

                                                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all"
                                                                style={{ width: `${width}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* HEATMAP */}
                                {batchResult.confusionMatrix && batchResult.labels && (
                                    <div className="rounded-xl border border-border bg-card/80 p-3">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                            <Thermometer size={14} className="text-red-500" />
                                            Matriz de Confusión (Heatmap)
                                        </div>

                                        <Heatmap matrix={batchResult.confusionMatrix} labels={batchResult.labels} />
                                    </div>
                                )}

                                {/* TF-IDF GLOBAL */}
                                {batchResult.globalTfidf?.length ? (
                                    <div className="rounded-xl border border-border bg-card/80 p-3">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                            <Gauge size={14} className="text-red-500" />
                                            TF-IDF Global (Top términos)
                                        </div>

                                        <div className="flex flex-wrap gap-1.5">
                                            {batchResult.globalTfidf.slice(0, 35).map((t, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 text-[11px] rounded-full bg-muted/60 border border-border"
                                                >
                                                    {t.term}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-border bg-card/80 p-3">
                                        <div className="text-[12px] text-red-500 font-semibold">
                                            Backend no envió globalTfidf.
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </Card>
    )
}