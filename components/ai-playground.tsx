'use client'

import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

import { InputPanel } from './playground/input-panel'
import { ReasoningPanel } from './playground/reasoning-panel'
import { TerminalPanel } from './playground/terminal-panel'

import type { SingleInferenceResult, BatchInferenceResult } from '@/types/ai'

export default function AIPlayground() {
    const [activeTab, setActiveTab] = useState<'manual' | 'batch'>('manual')
    const [isProcessing, setIsProcessing] = useState(false)

    const [manualResult, setManualResult] = useState<SingleInferenceResult | null>(null)
    const [batchResult, setBatchResult] = useState<BatchInferenceResult | null>(null)

    const [logs, setLogs] = useState<string[]>([])
    const terminalRef = useRef<HTMLDivElement>(null)

    const pushLog = (msg: string) => {
        setLogs((prev) => [...prev, `[INFO] ${new Date().toLocaleTimeString()} - ${msg}`])
    }

    const pushSuccess = (msg: string) => {
        setLogs((prev) => [...prev, `[SUCCESS] ${new Date().toLocaleTimeString()} - ${msg}`])
    }

    const pushError = (msg: string) => {
        setLogs((prev) => [...prev, `[ERROR] ${new Date().toLocaleTimeString()} - ${msg}`])
    }

    // ==============================
    // MANUAL INFERENCE
    // ==============================
    const handleManualSubmit = async (title: string, description: string) => {
        setIsProcessing(true)
        setManualResult(null)

        pushLog('Iniciando inferencia manual...')
        pushLog('Preprocesando texto (tokenización + limpieza)...')

        toast.loading('Ejecutando inferencia manual...', { id: 'manual' })

        try {
            const start = performance.now()

            const res = await fetch('http://localhost:8000/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description }),
            })

            const data = await res.json()
            const end = performance.now()

            if (!res.ok) {
                pushError(data.detail || 'Error desconocido en backend.')
                toast.error(data.detail || 'Error en inferencia manual', { id: 'manual' })
                return
            }

            if (data.is_garbage) {
                pushError('Ticket rechazado por heurística de basura.')
                toast.warning(data.message || 'Ticket inválido', { id: 'manual' })
                return
            }

            // BACKEND SAFE PARSING
            const safeProbabilities: Record<string, number> = data.probabilities ?? {}
            const safeTokens: string[] = data.tokens ?? []

            const safeTopTfidf: Array<{ term: string; weight: number }> =
                data.topTfidf ??
                data.top_tfidf ??
                []

            const result: SingleInferenceResult = {
                winner: data.winner ?? 'N/A',
                probabilities: safeProbabilities,
                tokens: safeTokens,
                latency: data.latency ?? Math.round(end - start),
                level: data.level ?? 'N/A',

                originalText: data.originalText ?? data.original_text ?? `${title}\n${description}`,
                cleanText: data.cleanText ?? data.cleaned_text ?? '',

                topTfidf: safeTopTfidf,
            }

            setManualResult(result)

            pushSuccess(`Inferencia completada. Winner: ${result.winner}`)
            pushLog(`Latencia: ${result.latency}ms`)

            toast.success(`Clasificado como: ${result.winner}`, {
                id: 'manual',
                description: `Latencia ${result.latency} ms`,
            })
        } catch (err: any) {
            pushError(`Fallo conexión backend: ${err.message}`)
            toast.error('No se pudo conectar al backend.', { id: 'manual' })
        } finally {
            setIsProcessing(false)
        }
    }

    // ==============================
    // FEEDBACK
    // ==============================
    const handleFeedback = async (originalText: string, correctDepartment: string) => {
        setIsProcessing(true)
        pushLog(`Registrando feedback humano -> ${correctDepartment}`)

        toast.loading('Enviando feedback...', { id: 'feedback' })

        try {
            const res = await fetch('http://localhost:8000/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    original_text: originalText,
                    correct_department: correctDepartment,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                pushError(data.detail || 'Error desconocido en feedback.')
                toast.error(data.detail || 'Error registrando feedback', { id: 'feedback' })
                return
            }

            pushSuccess('Feedback guardado correctamente.')
            if (data.learnedImmediately) pushSuccess('Aprendizaje incremental aplicado (SGD partial_fit).')
            if (data.retrainedBatch) pushSuccess('Reentrenamiento batch automático ejecutado.')

            toast.success('Feedback registrado', {
                id: 'feedback',
                description: data.message || 'Dataset actualizado correctamente',
            })
        } catch (err: any) {
            pushError(`Fallo feedback: ${err.message}`)
            toast.error('No se pudo enviar feedback.', { id: 'feedback' })
        } finally {
            setIsProcessing(false)
        }
    }

    // ==============================
    // BATCH CSV
    // ==============================
    const handleBatchUpload = async (file: File) => {
        setIsProcessing(true)
        setBatchResult(null)

        pushLog(`Cargando CSV batch: ${file.name}`)
        pushLog('Validando estructura del CSV...')
        pushLog('Ejecutando clasificación masiva...')

        toast.loading('Procesando CSV batch...', { id: 'batch' })

        try {
            const start = performance.now()

            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('http://localhost:8000/api/batch', {
                method: 'POST',
                body: formData,
            })

            const data = await res.json()
            const end = performance.now()

            if (!res.ok) {
                pushError(data.detail || 'Error batch desconocido.')
                toast.error(data.detail || 'Error procesando batch', { id: 'batch' })
                return
            }

            const result: BatchInferenceResult = {
                totalTickets: data.totalTickets ?? 0,
                processedCount: data.processedCount ?? 0,
                rejectedCount: data.rejectedCount ?? 0,

                f1Score: data.f1Score ?? 0,
                accuracy: data.accuracy ?? 0,

                bestModelName: data.bestModelName ?? 'N/A',
                optimalAlpha: data.optimalAlpha ?? null,

                confusionMatrix: data.confusionMatrix ?? [],
                labels: data.labels ?? [],

                departmentDistribution: data.departmentDistribution ?? {},
                globalTfidf: data.globalTfidf ?? [],

                speed: data.speed ?? Math.round(end - start),
            }

            setBatchResult(result)

            pushSuccess(`Batch completado: ${result.processedCount} tickets procesados.`)
            pushLog(`Modelo ganador: ${result.bestModelName}`)
            pushLog(`F1-score: ${result.f1Score}`)
            pushLog(`Tiempo total: ${result.speed}ms`)

            toast.success('Batch completado', {
                id: 'batch',
                description: `${result.processedCount} procesados | F1 ${result.f1Score.toFixed(3)}`,
            })
        } catch (err: any) {
            pushError(`Fallo batch: ${err.message}`)
            toast.error('No se pudo conectar al backend.', { id: 'batch' })
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-12 gap-4 h-full overflow-hidden"
            >
                <div className="col-span-4 h-full overflow-hidden">
                    <InputPanel
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        isProcessing={isProcessing}
                        onManualSubmit={handleManualSubmit}
                        onBatchUpload={handleBatchUpload}
                    />
                </div>

                <div className="col-span-8 h-full overflow-hidden flex flex-col gap-4">
                    <div className="flex-1 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25 }}
                                className="h-full"
                            >
                                <ReasoningPanel
                                    activeTab={activeTab}
                                    manualResult={manualResult}
                                    batchResult={batchResult}
                                    isProcessing={isProcessing}
                                    onFeedback={handleFeedback}
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Terminal abajo tipo consola MLOps */}
                    <div className="h-[180px] overflow-hidden">
                        <TerminalPanel logs={logs} isProcessing={isProcessing} terminalRef={terminalRef} />
                    </div>
                </div>
            </motion.div>
        </div>
    )
}