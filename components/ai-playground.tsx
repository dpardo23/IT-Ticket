"use client"

import React, { useState, useRef } from "react"
import { InputPanel } from "./playground/input-panel"
import { ReasoningPanel } from "./playground/reasoning-panel"
import { TerminalPanel } from "./playground/terminal-panel"
import { SingleInferenceResult, BatchInferenceStats, TokenWeight, LevelStats } from "@/types/ai"
import { Server, ShieldAlert, Database, Bug } from "lucide-react"

export default function AIPlayground() {
    const [activeTab, setActiveTab] = useState<string>("manual")
    const [isProcessing, setIsProcessing] = useState<boolean>(false)
    const [loadingStep, setLoadingStep] = useState<number>(0)

    const [manualTitle, setManualTitle] = useState<string>("")
    const [manualTicket, setManualTicket] = useState<string>("")
    const [singleResult, setSingleResult] = useState<SingleInferenceResult | null>(null)
    const [garbageError, setGarbageError] = useState<string | null>(null)

    const [csvStats, setCsvStats] = useState<BatchInferenceStats[]>([])
    const [batchTfidf, setBatchTfidf] = useState<TokenWeight[]>([])
    const [levelStats, setLevelStats] = useState<LevelStats[]>([])
    const [processedCount, setProcessedCount] = useState<number>(0)
    const [totalInCsv, setTotalInCsv] = useState<number>(0)
    const [progressValue, setProgressValue] = useState<number>(0)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const [f1Score, setF1Score] = useState<number>(0)
    const [confusionMatrix, setConfusionMatrix] = useState<number[][]>([])
    const [optimalAlpha, setOptimalAlpha] = useState<number>(0)
    const [bestModelName, setBestModelName] = useState<string>("")
    const [batchLatency, setBatchLatency] = useState<number>(0)
    const [singleLatency, setSingleLatency] = useState<number>(0)

    const [terminalLogs, setTerminalLogs] = useState<string[]>([
        `[INFO] ${new Date().toISOString().split('T')[1].slice(0, -4)} - Frontend Client inicializado.`,
        "[INFO] Esperando interacción del usuario para conectar con la API FastAPI..."
    ])
    const terminalRef = useRef<HTMLDivElement>(null)
    const [isLearning, setIsLearning] = useState<boolean>(false)
    const [feedbackGiven, setFeedbackGiven] = useState<boolean>(false)

    const addLog = (msg: string) => {
        setTerminalLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].slice(0, -4)}] ${msg}`])
    }

    const handleClear = () => {
        setManualTitle("");
        setManualTicket("");
        setSingleResult(null);
        setGarbageError(null);
        setFeedbackGiven(false);
        addLog(">> [CLIENTE] Interfaz limpiada. Listo para nuevo ingreso.");
    }

    const handleAnalyzeManual = async () => {
        if (!manualTicket || !manualTitle) return;
        setIsProcessing(true);
        setSingleResult(null);
        setGarbageError(null);
        setFeedbackGiven(false);
        setLoadingStep(1);

        addLog(`>> [CLIENTE] Iniciando POST http://localhost:8000/api/predict`);
        addLog(`>> [CLIENTE] PAYLOAD: { title: "${manualTitle.substring(0, 15)}...", size: ${manualTicket.length} bytes }`);

        try {
            const startTime = performance.now();

            const response = await fetch("http://localhost:8000/api/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: manualTitle, description: manualTicket })
            });

            if (!response.ok) throw new Error(`HTTP Error ${response.status}: Conexión rechazada.`);

            await new Promise(r => setTimeout(r, 400));
            setLoadingStep(2);

            const data = await response.json();

            if (data.is_garbage) {
                setGarbageError(data.message);
                addLog(`>> [WARNING] 406 Not Acceptable - Rechazado por Filtro Heurístico.`);
                setIsProcessing(false);
                return;
            }

            const latency = Math.round(performance.now() - startTime);
            setSingleLatency(latency);

            if (data.f1Score !== undefined) setF1Score(data.f1Score);
            if (data.optimalAlpha !== undefined) setOptimalAlpha(data.optimalAlpha);
            if (data.bestModelName !== undefined) setBestModelName(data.bestModelName);
            if (data.confusionMatrix !== undefined) setConfusionMatrix(data.confusionMatrix);

            await new Promise(r => setTimeout(r, 400));
            setLoadingStep(3);

            if (data.backend_logs && Array.isArray(data.backend_logs)) {
                data.backend_logs.forEach((log: string) => addLog(log));
            }

            await new Promise(r => setTimeout(r, 400));
            setLoadingStep(4);
            addLog(`>> [SUCCESS] 200 OK - Latencia de red: ${latency}ms`);

            setSingleResult({
                title: data.title,
                original: data.original,
                tokens: data.tokens,
                topTfidf: data.topTfidf,
                probabilities: data.probabilities.map((prob: any) => ({
                    ...prob,
                    icon: prob.name.includes("SysAdmin") ? <Server size={12} /> :
                        prob.name.includes("SecOps") ? <ShieldAlert size={12} /> :
                            prob.name.includes("DevOps") ? <Bug size={12} /> : <Database size={12} />
                })),
                winner: data.winner,
                level: data.level // <-- CAPTURADO DESDE LA API
            });

        } catch (error: any) {
            addLog(`>> [CRITICAL ERROR]: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    }

    const handleProcessCSV = async () => {
        if (!selectedFile) return;
        setIsProcessing(true);
        setProcessedCount(0);
        setProgressValue(0);
        setGarbageError(null);
        setLoadingStep(1);

        addLog(`>> [CLIENTE] INICIANDO: POST http://localhost:8000/api/batch`);
        addLog(`>> [CLIENTE] Preparando lote y validación K-Fold. Archivo: ${selectedFile.name}`);

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const startTime = performance.now();

            const progressInterval = setInterval(() => {
                setProgressValue(prev => prev < 90 ? prev + 10 : prev);
            }, 500);

            const response = await fetch("http://localhost:8000/api/batch", {
                method: "POST",
                body: formData
            });

            clearInterval(progressInterval);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Error HTTP ${response.status}`);
            }

            await new Promise(r => setTimeout(r, 500));
            setLoadingStep(2);

            const data = await response.json();
            const latency = Math.round(performance.now() - startTime);

            await new Promise(r => setTimeout(r, 500));
            setLoadingStep(3);

            if (data.backend_logs && Array.isArray(data.backend_logs)) {
                data.backend_logs.forEach((log: string) => addLog(log));
            }

            await new Promise(r => setTimeout(r, 600));
            setLoadingStep(4);

            setProcessedCount(data.processedCount);
            setTotalInCsv(data.totalTickets);
            setProgressValue(100);

            setF1Score(data.f1Score);
            setConfusionMatrix(data.confusionMatrix || []);
            setOptimalAlpha(data.optimalAlpha);
            setBestModelName(data.bestModelName);
            setBatchLatency(data.speed);

            setCsvStats(data.departmentStats);
            setLevelStats(data.levelStats);
            setBatchTfidf(data.globalTfidf.slice(0, 10));

            addLog(`>> [SUCCESS] Matriz óptima generada y persistida en ${latency}ms.`);

        } catch (error: any) {
            addLog(`>> [ERROR BATCH]: ${error.message}`);
            setProgressValue(0);
            setGarbageError(error.message);
        } finally {
            setIsProcessing(false);
        }
    }

    const handleFeedback = async (isCorrect: boolean) => {
        if (!singleResult) return;

        setIsLearning(true);
        setFeedbackGiven(true);

        let correctDept = singleResult.winner;

        if (!isCorrect) {
            const userInput = window.prompt(
                "APRENDIZAJE ONLINE (Human-in-the-Loop):\nLa IA clasificó esto de forma errónea. Ingresa el departamento correcto para recalibrar los tensores matemáticos:\n(Opciones: Mesa de Servicios, Microinformática, SysAdmins, NetOps, SecOps / IAM, DevOps)"
            );

            if (!userInput) {
                addLog(">> [WARNING] Operación cancelada. El ajuste de pesos (partial_fit) fue abortado por el usuario.");
                setIsLearning(false);
                setFeedbackGiven(false);
                return;
            }
            correctDept = userInput;
        }

        addLog(`>> [CLIENTE] INICIANDO: POST http://localhost:8000/api/feedback`);
        addLog(`>> [CLIENTE] ENVIANDO GROUND TRUTH: '${correctDept}'`);

        try {
            const startTime = performance.now();

            const response = await fetch("http://localhost:8000/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    original_text: singleResult.title + " " + singleResult.original,
                    correct_department: correctDept
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Error interno HTTP ${response.status}`);
            }

            const data = await response.json();
            const latency = Math.round(performance.now() - startTime);

            if (data.backend_logs && Array.isArray(data.backend_logs)) {
                data.backend_logs.forEach((log: string) => addLog(log));
            }

            addLog(`>> [SUCCESS] 200 OK - Latencia total: ${latency}ms`);

        } catch (error: any) {
            addLog(`>> [ERROR EN APRENDIZAJE]: ${error.message}`);
            setFeedbackGiven(false);
        } finally {
            setIsLearning(false);
        }
    }

    return (
        <div className="h-full flex flex-col xl:flex-row gap-4 min-h-0 w-full">
            <InputPanel
                activeTab={activeTab} setActiveTab={setActiveTab}
                isProcessing={isProcessing}
                manualTitle={manualTitle} setManualTitle={setManualTitle}
                manualTicket={manualTicket} setManualTicket={setManualTicket}
                handleAnalyzeManual={handleAnalyzeManual}
                handleProcessCSV={handleProcessCSV}
                handleClear={handleClear}
                processedCount={processedCount} totalInCsv={totalInCsv} progressValue={progressValue}
                selectedFile={selectedFile} setSelectedFile={setSelectedFile}
            />
            <div className="flex flex-col gap-4 h-full min-h-0 xl:w-[74%] w-full">
                <ReasoningPanel
                    activeTab={activeTab} isProcessing={isProcessing} loadingStep={loadingStep}
                    singleResult={singleResult} garbageError={garbageError} csvStats={csvStats} batchTfidf={batchTfidf} levelStats={levelStats}
                    processedCount={processedCount} feedbackGiven={feedbackGiven} isLearning={isLearning} handleFeedback={handleFeedback}
                    f1Score={f1Score} confusionMatrix={confusionMatrix} optimalAlpha={optimalAlpha} bestModelName={bestModelName} batchLatency={batchLatency}
                    singleLatency={singleLatency}
                />
                <TerminalPanel logs={terminalLogs} isProcessing={isProcessing} terminalRef={terminalRef} />
            </div>
        </div>
    )
}