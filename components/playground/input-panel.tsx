"use client"

import React, { useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import {
    UploadCloud,
    FileText,
    Loader2,
    PlayCircle,
    ShieldAlert,
    Keyboard,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface InputPanelProps {
    activeTab: "manual" | "batch"
    setActiveTab: (tab: "manual" | "batch") => void
    isProcessing: boolean
    onManualSubmit: (title: string, description: string) => void
    onBatchUpload: (file: File) => void
}

export function InputPanel({
    activeTab,
    setActiveTab,
    isProcessing,
    onManualSubmit,
    onBatchUpload,
}: InputPanelProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [csvFile, setCsvFile] = useState<File | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const maxDescLength = 800
    const minDescLength = 15

    const descCount = description.length

    const descValid = useMemo(() => {
        return descCount >= minDescLength
    }, [descCount])

    const handleManualClick = () => {
        if (isProcessing) return

        if (title.trim().length < 3) {
            toast.warning("El título es muy corto", {
                description: "Mínimo recomendado: 3 caracteres.",
            })
            return
        }

        if (!descValid) {
            toast.warning("Descripción insuficiente", {
                description: `Mínimo recomendado: ${minDescLength} caracteres.`,
            })
            return
        }

        onManualSubmit(title.trim(), description.trim())
    }

    const handleFileSelect = (file: File) => {
        if (!file) return

        if (!file.name.toLowerCase().endsWith(".csv")) {
            toast.error("Solo se permiten archivos CSV")
            return
        }

        setCsvFile(file)

        toast.success("CSV cargado", {
            description: file.name,
        })

        // Ejecutar automáticamente el batch al seleccionar
        onBatchUpload(file)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        if (isProcessing) return

        const file = e.dataTransfer.files?.[0]
        if (!file) return

        handleFileSelect(file)
    }

    const handleBrowseClick = () => {
        if (isProcessing) return
        fileInputRef.current?.click()
    }

    return (
        <Card className="h-full rounded-2xl border-border bg-card/70 backdrop-blur-md shadow-xl overflow-hidden flex flex-col">
            {/* HEADER */}
            <div className="h-[45px] px-4 flex items-center justify-between bg-gradient-to-r from-red-600 to-red-500 text-white">
                <div className="flex items-center gap-2 font-semibold tracking-tight">
                    <Keyboard size={16} />
                    <span className="text-sm">Input Panel</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => !isProcessing && setActiveTab("manual")}
                        className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${activeTab === "manual"
                                ? "bg-white/20 border border-white/30"
                                : "opacity-70 hover:opacity-100"
                            }`}
                    >
                        Manual
                    </button>

                    <button
                        onClick={() => !isProcessing && setActiveTab("batch")}
                        className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${activeTab === "batch"
                                ? "bg-white/20 border border-white/30"
                                : "opacity-70 hover:opacity-100"
                            }`}
                    >
                        Batch
                    </button>
                </div>
            </div>

            {/* BODY */}
            <div
                className={`flex-1 overflow-y-auto p-4 space-y-4 transition-all ${isProcessing ? "pointer-events-none opacity-70" : ""
                    }`}
            >
                {/* ===================== */}
                {/* MANUAL TAB */}
                {/* ===================== */}
                {activeTab === "manual" && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                    >
                        <div className="rounded-xl border border-border bg-card/80 p-3 space-y-3">
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <FileText size={14} className="text-red-500" />
                                Ticket Manual
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-foreground">
                                    Título
                                </label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ej: Error de VPN"
                                    className="h-9 rounded-xl"
                                    disabled={isProcessing}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-foreground">
                                    Descripción
                                </label>

                                <textarea
                                    value={description}
                                    onChange={(e) => {
                                        if (e.target.value.length <= maxDescLength) {
                                            setDescription(e.target.value)
                                        }
                                    }}
                                    placeholder="Describe el problema con detalle técnico..."
                                    disabled={isProcessing}
                                    className="w-full min-h-[150px] resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all"
                                />

                                <div className="flex justify-between text-[11px] text-muted-foreground">
                                    <span>
                                        Min recomendado: {minDescLength} caracteres
                                    </span>
                                    <span
                                        className={`font-semibold ${descValid ? "text-green-500" : "text-red-500"
                                            }`}
                                    >
                                        {descCount}/{maxDescLength}
                                    </span>
                                </div>

                                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all"
                                        style={{ width: `${(descCount / maxDescLength) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleManualClick}
                            disabled={isProcessing}
                            className="w-full h-11 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold shadow-md"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 size={16} className="animate-spin mr-2" />
                                    Analizando...
                                </>
                            ) : (
                                <>
                                    <PlayCircle size={16} className="mr-2" />
                                    Analizar Ticket
                                </>
                            )}
                        </Button>

                        <div className="rounded-xl border border-border bg-muted/30 p-3 text-[11px] text-muted-foreground leading-relaxed flex gap-2">
                            <ShieldAlert size={14} className="text-red-500 shrink-0 mt-0.5" />
                            <div>
                                Evita descripciones vacías o irrelevantes. El sistema puede
                                rechazar tickets considerados "basura" por heurística NLP.
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ===================== */}
                {/* BATCH TAB */}
                {/* ===================== */}
                {activeTab === "batch" && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                    >
                        <div className="rounded-xl border border-border bg-card/80 p-3 space-y-2">
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <UploadCloud size={14} className="text-red-500" />
                                Subida Masiva (CSV)
                            </div>

                            <div className="text-[11px] text-muted-foreground leading-relaxed">
                                Sube un archivo CSV con columnas obligatorias:
                                <b> title, description, department</b>
                            </div>
                        </div>

                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className="rounded-xl border border-dashed border-border bg-muted/20 hover:bg-muted/30 transition-all p-5 flex flex-col items-center justify-center text-center cursor-pointer"
                            onClick={handleBrowseClick}
                        >
                            <UploadCloud size={30} className="text-red-500 mb-2" />

                            <div className="text-sm font-semibold">
                                {csvFile ? csvFile.name : "Selecciona o arrastra un CSV"}
                            </div>

                            <div className="text-xs text-muted-foreground mt-1">
                                Compatible con 3,000+ tickets
                            </div>

                            <div className="mt-3 text-[11px] text-muted-foreground">
                                Click para buscar archivo
                            </div>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={(e) => {
                                const f = e.target.files?.[0]
                                if (!f) return
                                handleFileSelect(f)
                            }}
                            disabled={isProcessing}
                        />

                        <Button
                            onClick={() => {
                                if (!csvFile) {
                                    toast.warning("No hay archivo seleccionado")
                                    return
                                }
                                onBatchUpload(csvFile)
                            }}
                            disabled={isProcessing || !csvFile}
                            className="w-full h-11 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold shadow-md"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 size={16} className="animate-spin mr-2" />
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <PlayCircle size={16} className="mr-2" />
                                    Ejecutar Batch
                                </>
                            )}
                        </Button>
                    </motion.div>
                )}
            </div>
        </Card>
    )
}