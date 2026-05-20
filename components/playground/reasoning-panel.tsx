"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Bar, XAxis, YAxis } from "recharts"
import { BrainCircuit, ShieldAlert, ThumbsUp, ThumbsDown, Loader2, CheckCircle2, Server, Database, Bug, Activity, Timer, Settings2 } from "lucide-react"
import { SingleInferenceResult, BatchInferenceStats, TokenWeight, LevelStats } from "@/types/ai"

const NEO_RED_PALETTE = ["#FF2A4D", "#E62645", "#CC223D", "#B31E36", "#99192E", "#801526"]
const DEPARTMENTS = ["Mesa de Servicios", "Microinformática", "SysAdmins", "NetOps", "SecOps / IAM", "DevOps"]

const getIconForDepartment = (name: string) => {
    if (name.includes("SysAdmin")) return <Server size={12} />;
    if (name.includes("SecOps")) return <ShieldAlert size={12} />;
    if (name.includes("DevOps")) return <Bug size={12} />;
    return <Database size={12} />;
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-card border border-border p-3 rounded-xl shadow-2xl min-w-[240px] z-50 relative">
                <h3 className="font-normal text-primary flex items-center gap-2 border-b border-border/50 pb-2 mb-2 text-xs">{data.name}</h3>
                <p className="text-[10px] text-muted-foreground mb-3 leading-relaxed">{data.desc}</p>
                <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg">
                    <span className="text-[10px] text-foreground">Volumen:</span>
                    <span className="text-xs font-mono text-primary">{data.tickets?.toLocaleString() || 0}</span>
                </div>
            </div>
        );
    }
    return null;
}

interface ReasoningPanelProps {
    activeTab: string;
    isProcessing: boolean;
    loadingStep: number;
    singleResult: SingleInferenceResult | null;
    garbageError: string | null;
    csvStats: BatchInferenceStats[];
    batchTfidf: TokenWeight[];
    levelStats: LevelStats[];
    processedCount: number;
    feedbackGiven: boolean;
    isLearning: boolean;
    handleFeedback: (isCorrect: boolean) => void;
    f1Score: number;
    confusionMatrix: number[][] | undefined;
    optimalAlpha: number;
    bestModelName: string;
    batchLatency: number;
    singleLatency: number;
}

export function ReasoningPanel(props: ReasoningPanelProps) {
    const { activeTab, isProcessing, loadingStep, singleResult, garbageError, csvStats, batchTfidf, levelStats, processedCount, feedbackGiven, isLearning, handleFeedback, f1Score, confusionMatrix, optimalAlpha, bestModelName, batchLatency, singleLatency } = props;

    return (
        <Card className="flex-1 flex flex-col bg-card border-border shadow-inner rounded-xl overflow-hidden min-h-0 relative">
            <CardHeader className="shrink-0 border-b border-border bg-primary text-primary-foreground px-4 py-0 h-[65px] flex flex-row items-center justify-between z-20 shadow-sm">
                <div className="flex flex-col justify-center">
                    <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                        <BrainCircuit size={16} className={isProcessing ? "animate-pulse" : ""} />
                        Razonamiento de la IA
                    </CardTitle>
                    <p className="text-[9px] text-primary-foreground/80 mt-0.5 font-normal">Motor de inferencia y métricas en tiempo real</p>
                </div>
                {isProcessing && <Badge variant="secondary" className="animate-pulse py-0 h-5 text-[9px] leading-none flex items-center font-bold border-none text-primary bg-primary-foreground">Motor Activo</Badge>}
            </CardHeader>

            <CardContent className="flex-1 p-4 flex flex-col min-h-0 relative overflow-hidden bg-muted/5">
                {isProcessing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/95 backdrop-blur-sm z-30 animate-in fade-in zoom-in-95">
                        <div className="relative flex items-center justify-center w-24 h-24 mb-6">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary/20 rounded-full animate-ping"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-primary/40 rounded-full animate-pulse"></div>
                            <div className="relative z-10 bg-card border border-primary rounded-full p-4 shadow-[0_0_20px_rgba(var(--primary),0.4)]">
                                <BrainCircuit size={32} className="text-primary animate-pulse" />
                            </div>
                        </div>
                        <div className="w-full max-w-[260px] space-y-2.5">
                            <div className={`flex items-center justify-between text-[9px] font-normal uppercase tracking-widest transition-all duration-500 ${loadingStep >= 1 ? "text-primary translate-x-1" : "text-muted-foreground opacity-50"}`}>
                                <span className="flex items-center gap-1.5">1. {activeTab === "csv" ? "Subiendo Lote CSV y K-Fold" : "Transmitiendo a la API"}</span>
                                {loadingStep > 1 ? <CheckCircle2 size={12} className="text-emerald-500" /> : loadingStep === 1 ? <Loader2 className="animate-spin" size={12} /> : null}
                            </div>
                            <div className={`flex items-center justify-between text-[9px] font-normal uppercase tracking-widest transition-all duration-500 ${loadingStep >= 2 ? "text-primary translate-x-1" : "text-muted-foreground opacity-50"}`}>
                                <span className="flex items-center gap-1.5">2. Limpieza Léxica y Vectorización</span>
                                {loadingStep > 2 ? <CheckCircle2 size={12} className="text-emerald-500" /> : loadingStep === 2 ? <Loader2 className="animate-spin" size={12} /> : null}
                            </div>
                            <div className={`flex items-center justify-between text-[9px] font-normal uppercase tracking-widest transition-all duration-500 ${loadingStep >= 3 ? "text-primary translate-x-1" : "text-muted-foreground opacity-50"}`}>
                                <span className="flex items-center gap-1.5">3. {activeTab === "csv" ? "Entrenando Modelo Predictivo" : "Extraer matriz tf-idf global"}</span>
                                {loadingStep > 3 ? <CheckCircle2 size={12} className="text-emerald-500" /> : loadingStep === 3 ? <Loader2 className="animate-spin" size={12} /> : null}
                            </div>
                            <div className={`flex items-center justify-between text-[9px] font-normal uppercase tracking-widest transition-all duration-500 ${loadingStep >= 4 ? "text-primary translate-x-1" : "text-muted-foreground opacity-50"}`}>
                                <span className="flex items-center gap-1.5">4. Grid Search e Inferencia Final</span>
                                {loadingStep > 4 ? <CheckCircle2 size={12} className="text-emerald-500" /> : loadingStep === 4 ? <Loader2 className="animate-spin" size={12} /> : null}
                            </div>
                        </div>
                    </div>
                )}

                {garbageError && !isProcessing && (
                    <div className="h-full flex flex-col items-center justify-center text-amber-500 animate-in fade-in zoom-in-95">
                        <ShieldAlert size={48} className="mb-4 animate-bounce" />
                        <h3 className="font-bold text-sm uppercase tracking-widest mb-2 text-center">Análisis Rechazado</h3>
                        <p className="text-xs text-center max-w-[320px] opacity-80 leading-relaxed font-mono">{garbageError}</p>
                    </div>
                )}

                {activeTab === "manual" && singleResult && !isProcessing && !garbageError && (
                    <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1">
                        <div className="grid grid-cols-3 gap-3 shrink-0 w-full mb-0.5">
                            <div className="bg-card border border-border py-1.5 px-3 flex flex-col justify-center shadow-sm rounded-lg">
                                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground uppercase tracking-widest mb-0.5"><Activity size={10} className="text-primary" /> F1-Score Base</div>
                                <div className="text-sm text-primary leading-none font-mono">{f1Score > 0 ? f1Score : "-"}{f1Score > 0 && "%"}</div>
                            </div>
                            <div className="bg-card border border-border py-1.5 px-3 flex flex-col justify-center shadow-sm rounded-lg">
                                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground uppercase tracking-widest mb-0.5"><Settings2 size={10} className="text-primary" /> Modelo Activo</div>
                                <div className="flex items-baseline gap-1.5 leading-none">
                                    <span className="text-sm text-foreground">{bestModelName}</span>
                                    <span className="text-[8px] text-muted-foreground font-mono bg-primary/10 px-1 rounded">α={optimalAlpha}</span>
                                </div>
                            </div>
                            <div className="bg-card border border-border py-1.5 px-3 flex flex-col justify-center shadow-sm rounded-lg">
                                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground uppercase tracking-widest mb-0.5"><Timer size={10} className="text-primary" /> Latencia CPU</div>
                                <div className="text-sm text-foreground leading-none font-mono">{singleLatency}<span className="text-[10px] text-muted-foreground ml-0.5">ms</span></div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 shrink-0">
                            <div className="w-full md:w-1/2 flex flex-col gap-3">
                                <div className="space-y-1.5">
                                    <h4 className="text-[9px] font-normal text-muted-foreground uppercase tracking-widest flex items-center gap-1"><span className="bg-primary text-primary-foreground w-3 h-3 flex items-center justify-center rounded-full text-[7px]">1</span>Preprocesamiento</h4>
                                    <div className="bg-card border border-border rounded-lg p-2.5 space-y-2 shadow-sm">
                                        <div>
                                            <p className="text-[8px] text-muted-foreground mb-0.5">Texto Original:</p>
                                            <p className="text-[9px] text-foreground italic border-l-2 border-primary/30 pl-1.5 opacity-80 line-clamp-2">"{singleResult.original}"</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] text-muted-foreground mb-1">Tokens Retornados por API:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {singleResult.tokens.map((token: string, idx: number) => (<Badge key={idx} variant="outline" className="font-mono text-[8px] px-1 py-0 h-3.5 bg-muted/50 border-border text-primary font-normal">{token}</Badge>))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <h4 className="text-[9px] font-normal text-muted-foreground uppercase tracking-widest flex items-center gap-1"><span className="bg-primary text-primary-foreground w-3 h-3 flex items-center justify-center rounded-full text-[7px]">2</span>Matriz TF-IDF (Documento)</h4>
                                    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                                        <table className="w-full text-[9px] text-left">
                                            <thead className="bg-muted/30 border-b border-border">
                                                <tr><th className="px-2 py-1 font-normal text-muted-foreground">Término</th><th className="px-2 py-1 font-normal text-muted-foreground text-right">Peso</th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {singleResult.topTfidf.map((item: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-muted/10"><td className="px-2 py-1 font-mono text-foreground">"{item.token}"</td><td className="px-2 py-1 text-right font-mono text-primary">{item.weight.toFixed(4)}</td></tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-1/2 flex flex-col gap-3">
                                <div className="space-y-1.5">
                                    <h4 className="text-[9px] font-normal text-muted-foreground uppercase tracking-widest flex items-center gap-1"><span className="bg-primary text-primary-foreground w-3 h-3 flex items-center justify-center rounded-full text-[7px]">3</span>Probabilidades del Modelo</h4>
                                    <div className="space-y-2 bg-card p-2.5 rounded-lg border border-border shadow-sm">
                                        {singleResult.probabilities.map((prob: any, idx: number) => (
                                            <div key={idx} className="space-y-0.5">
                                                <div className="flex justify-between items-center text-[9px] text-foreground">
                                                    <span className="flex items-center gap-1"><span className={prob.name === singleResult.winner ? "text-primary" : "text-muted-foreground"}>{getIconForDepartment(prob.name)}</span>{prob.name}</span>
                                                    <span className={prob.name === singleResult.winner ? "text-primary" : "text-muted-foreground"}>{prob.value}%</span>
                                                </div>
                                                <div className="w-full bg-muted rounded-full h-1 border border-border/50 overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-1000 ${prob.name === singleResult.winner ? "bg-primary" : "bg-muted-foreground/30"}`} style={{ width: `${prob.value}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Card className="flex-1 flex flex-col justify-center border-primary border bg-primary/5 shadow-[0_0_10px_rgba(var(--primary),0.1)] rounded-lg min-h-[120px]">
                                    <CardContent className="p-3 flex flex-col items-center">
                                        <p className="text-[8px] text-primary/80 uppercase tracking-widest text-center">Predicción de la API</p>
                                        <h3 className="text-sm text-primary tracking-tight text-center font-normal">{singleResult.winner}</h3>
                                        {!feedbackGiven ? (
                                            <div className="mt-2 pt-2 border-t border-primary/20 flex flex-col items-center gap-1.5 w-full">
                                                <span className="text-[8px] uppercase text-muted-foreground">Validar con Backend</span>
                                                <div className="flex gap-1.5 w-full justify-center">
                                                    <Button size="sm" variant="outline" className="h-5 text-[8px] border-emerald-500/30 text-emerald-500 px-1.5 font-normal" onClick={() => handleFeedback(true)}><ThumbsUp size={8} className="mr-1" /> Correcto</Button>
                                                    <Button size="sm" variant="outline" className="h-5 text-[8px] border-red-500/30 text-red-500 px-1.5 font-normal" onClick={() => handleFeedback(false)}><ThumbsDown size={8} className="mr-1" /> Error</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-2 pt-2 border-t border-primary/20 flex items-center justify-center min-h-[20px] w-full">
                                                {isLearning ? (
                                                    <span className="text-primary text-[8px] uppercase animate-pulse flex items-center gap-1"><BrainCircuit size={10} /> Enviando ajuste a API...</span>
                                                ) : (
                                                    <span className="text-emerald-500 text-[8px] uppercase flex items-center gap-1"><ShieldAlert size={10} /> Pesos Actualizados</span>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <div className="w-full shrink-0 flex flex-col gap-1.5 mt-1 mb-2">
                            <h4 className="text-[9px] font-normal text-muted-foreground uppercase tracking-widest flex items-center gap-1"><span className="bg-primary text-primary-foreground w-3 h-3 flex items-center justify-center rounded-full text-[7px]">4</span>Matriz de Confusión Estructural ($C \times C$)</h4>
                            <div className="bg-card border border-border rounded-lg p-2.5 shadow-sm overflow-hidden w-full">
                                <div className="w-full overflow-x-auto bg-muted/20 rounded border border-border/50">
                                    <table className="w-full text-[8px] border-collapse table-fixed min-w-[500px]">
                                        <thead className="bg-card shadow-[0_1px_0_0_rgba(0,0,0,0.1)]">
                                            <tr>
                                                <th className="border-b border-r border-border/50 p-1 text-left text-primary bg-card w-[80px] font-normal">Real \ Pred</th>
                                                {DEPARTMENTS.map((d, i) => <th key={i} className="border-b border-border/50 p-1 text-muted-foreground bg-card text-center text-[8px] truncate font-normal">{d.substring(0, 8)}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {confusionMatrix && confusionMatrix.length > 0 ? confusionMatrix.map((row, i) => (
                                                <tr key={i} className="hover:bg-muted/10">
                                                    <td className="border-r border-b border-border/50 p-1 text-muted-foreground bg-card truncate font-normal">{DEPARTMENTS[i]}</td>
                                                    {row.map((val, j) => (
                                                        <td key={j} className={`border-b border-border/50 p-1 text-center font-mono ${i === j ? 'bg-primary/10 text-primary' : 'text-foreground'}`}>{val}</td>
                                                    ))}
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={7} className="text-center p-2 text-muted-foreground italic">Matriz no disponible. Requiere entrenamiento Batch previo.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "csv" && processedCount > 0 && !isProcessing && !garbageError && (
                    <div className="w-full h-full flex flex-col gap-3 min-h-0 animate-in fade-in duration-500">
                        <div className="grid grid-cols-3 gap-3 shrink-0 w-full mb-0.5">
                            <div className="bg-card border border-border py-1.5 px-3 flex flex-col justify-center shadow-sm rounded-lg">
                                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground uppercase tracking-widest mb-0.5"><Activity size={10} className="text-primary" /> Rendimiento F1-Score</div>
                                <div className="text-sm text-primary leading-none font-mono">{f1Score}%</div>
                            </div>
                            <div className="bg-card border border-border py-1.5 px-3 flex flex-col justify-center shadow-sm rounded-lg">
                                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground uppercase tracking-widest mb-0.5"><Settings2 size={10} className="text-primary" /> Modelo Ganador</div>
                                <div className="flex items-baseline gap-1.5 leading-none">
                                    <span className="text-sm text-foreground">{bestModelName}</span>
                                    <span className="text-[8px] text-muted-foreground font-mono bg-primary/10 px-1 rounded">α={optimalAlpha}</span>
                                </div>
                            </div>
                            <div className="bg-card border border-border py-1.5 px-3 flex flex-col justify-center shadow-sm rounded-lg">
                                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground uppercase tracking-widest mb-0.5"><Timer size={10} className="text-primary" /> Latencia CPU</div>
                                <div className="text-sm text-foreground leading-none font-mono">{batchLatency}<span className="text-[10px] text-muted-foreground ml-0.5">ms</span></div>
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3 overflow-hidden">
                            <div className="w-full md:w-[55%] flex flex-col gap-3 h-full min-h-0">
                                <div className="bg-card border border-border rounded-lg p-2 flex-1 min-h-0 flex flex-col shadow-sm">
                                    <h4 className="text-[9px] font-normal text-muted-foreground uppercase tracking-widest mb-1.5 shrink-0">Matriz de Confusión ($C \times C$)</h4>
                                    <div className="w-full flex-1 overflow-auto bg-muted/20 rounded border border-border/50">
                                        <table className="w-full text-[8px] border-collapse table-fixed">
                                            <thead className="bg-card sticky top-0 z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.1)]">
                                                <tr>
                                                    <th className="border-b border-r border-border/50 p-1 text-left text-primary bg-card w-[70px] font-normal">Real \ Pred</th>
                                                    {DEPARTMENTS.map((d, i) => <th key={i} className="border-b border-border/50 p-1 text-muted-foreground bg-card text-center text-[7px] truncate font-normal">{d.substring(0, 6)}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {confusionMatrix && confusionMatrix.length > 0 ? confusionMatrix.map((row, i) => (
                                                    <tr key={i} className="hover:bg-muted/10">
                                                        <td className="border-r border-b border-border/50 p-1 text-muted-foreground bg-card truncate font-normal">{DEPARTMENTS[i].substring(0, 6)}</td>
                                                        {row.map((val, j) => (
                                                            <td key={j} className={`border-b border-border/50 p-1 text-center font-mono ${i === j ? 'bg-primary/10 text-primary' : 'text-foreground'}`}>{val}</td>
                                                        ))}
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan={7} className="text-center p-2 text-muted-foreground italic">Calculando...</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="bg-card border border-border rounded-lg p-2 flex-1 min-h-0 flex flex-col shadow-sm">
                                    <h4 className="text-[9px] font-normal text-muted-foreground uppercase tracking-widest mb-1.5 shrink-0">Distribución Resultante de la IA</h4>
                                    <div className="flex-1 min-h-0 w-full flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={csvStats} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={8} stroke="var(--muted-foreground)" />
                                                <YAxis axisLine={false} tickLine={false} fontSize={8} stroke="var(--muted-foreground)" tickFormatter={(val) => val.toLocaleString()} />
                                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
                                                <Bar dataKey="tickets" radius={[2, 2, 0, 0]} maxBarSize={35} animationDuration={500}>
                                                    {csvStats.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-[45%] flex flex-col gap-3 h-full min-h-0">
                                <div className="bg-card border border-border rounded-lg flex-1 min-h-0 flex flex-col shadow-sm overflow-hidden">
                                    <div className="p-1.5 border-b border-border bg-muted/30 shrink-0">
                                        <h4 className="text-[8px] font-normal text-muted-foreground uppercase tracking-widest">Matriz TF-IDF Global (Top 10)</h4>
                                    </div>
                                    <div className="flex-1 overflow-y-auto bg-muted/10">
                                        <table className="w-full text-[9px] text-left border-collapse">
                                            <thead className="bg-card border-b border-border sticky top-0 z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
                                                <tr><th className="px-2 py-1 font-normal text-muted-foreground bg-card">Término</th><th className="px-2 py-1 font-normal text-muted-foreground text-right bg-card">Peso</th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {batchTfidf.map((item: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-muted/20"><td className="px-2 py-1 font-mono text-foreground">"{item.token}"</td><td className="px-2 py-1 text-right font-mono text-primary">{item.weight > 0 ? item.weight.toFixed(4) : "-"}</td></tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="bg-card border border-border rounded-lg p-2 shrink-0 h-[110px] flex flex-col items-center justify-center relative shadow-sm overflow-hidden">
                                    <h4 className="text-[8px] font-normal text-muted-foreground uppercase tracking-widest absolute top-1.5 left-1.5 bg-card z-10 pr-2">Heurística Semántica (Triaje)</h4>
                                    <div className="h-[65px] w-full mt-3 flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={levelStats} cx="50%" cy="50%" innerRadius={18} outerRadius={28} paddingAngle={2} dataKey="value" stroke="none" animationDuration={500}>
                                                    {levelStats.map((entry, index) => (<Cell key={`cell-${index}`} fill={NEO_RED_PALETTE[index % 3]} />))}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '9px', color: 'var(--foreground)', padding: '2px 4px' }} itemStyle={{ color: 'var(--foreground)' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex gap-2 text-[7px] text-muted-foreground uppercase mt-1 shrink-0">
                                        <span>N1 (Normal)</span><span>N2 (Especializado)</span><span>N3 (Crítico)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!singleResult && processedCount === 0 && !isProcessing && !garbageError && (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
                        <BrainCircuit size={40} className="mb-2 stroke-[1]" />
                        <p className="font-normal tracking-widest uppercase text-[10px]">API en Espera</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}