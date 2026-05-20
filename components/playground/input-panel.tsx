"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Database, FileSpreadsheet, UploadCloud, Trash2 } from "lucide-react"
import { useRef } from "react"

interface InputPanelProps {
    activeTab: string;
    setActiveTab: (val: string) => void;
    isProcessing: boolean;
    manualTitle: string;
    setManualTitle: (val: string) => void;
    manualTicket: string;
    setManualTicket: (val: string) => void;
    handleAnalyzeManual: () => void;
    handleProcessCSV: () => void;
    handleClear: () => void;
    processedCount: number;
    totalInCsv: number;
    progressValue: number;
    selectedFile: File | null;
    setSelectedFile: (file: File | null) => void;
}

export function InputPanel(props: InputPanelProps) {
    const { activeTab, setActiveTab, isProcessing, manualTitle, setManualTitle, manualTicket, setManualTicket, handleAnalyzeManual, handleProcessCSV, handleClear, processedCount, totalInCsv, progressValue, selectedFile, setSelectedFile } = props;

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.name.endsWith('.csv')) setSelectedFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    return (
        <Card className="flex flex-col h-full bg-card border-border shadow-md rounded-xl overflow-hidden min-h-0 xl:w-[26%] shrink-0">
            <CardHeader className="shrink-0 border-b border-border bg-primary text-primary-foreground px-4 py-0 h-[65px] flex flex-col justify-center">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <Database size={16} /> Ingesta de Datos
                </CardTitle>
                <p className="text-[9px] text-primary-foreground/80 mt-0.5 font-normal">Carga de incidentes manual y por lotes</p>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-4 flex flex-col overflow-y-auto">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col min-h-0">
                    <TabsList className="shrink-0 grid w-full grid-cols-2 p-1 bg-muted/50 rounded-lg mb-3">
                        <TabsTrigger value="manual" className="rounded-md text-[10px] font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Ingreso Manual</TabsTrigger>
                        <TabsTrigger value="csv" className="rounded-md text-[10px] font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Carga por Lotes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual" className="space-y-3 flex-1 flex flex-col min-h-0 mt-0">
                        <div className="shrink-0 space-y-1 relative">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Título (Asunto)</label>
                            <Input maxLength={100} placeholder="Ej: No puedo acceder al ERP" className="bg-background border-border text-xs focus-visible:ring-primary h-8 pr-12" value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} disabled={isProcessing} />
                            <span className="absolute bottom-2 right-2 text-[8px] text-muted-foreground bg-background px-1">{manualTitle.length}/100</span>
                        </div>
                        <div className="space-y-1 flex-1 flex flex-col min-h-0 relative">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Descripción (Raw Text)</label>
                            <Textarea maxLength={2000} placeholder="Escribe el texto crudo del incidente..." className="flex-1 min-h-0 resize-none text-xs p-3 pb-6 rounded-lg border-border bg-background focus-visible:ring-primary leading-relaxed" value={manualTicket} onChange={(e) => setManualTicket(e.target.value)} disabled={isProcessing} />
                            <span className="absolute bottom-2 right-2 text-[8px] text-muted-foreground bg-background px-1 rounded">{manualTicket.length}/2000</span>
                        </div>
                        <div className="flex gap-2 mt-1 shrink-0">
                            <Button size="sm" variant="outline" className="h-8 w-10 shrink-0 border-border text-muted-foreground hover:text-destructive" onClick={handleClear} disabled={isProcessing}><Trash2 size={14} /></Button>
                            <Button size="sm" className={`flex-1 font-bold rounded-lg h-8 text-[10px] ${isProcessing ? 'animate-pulse-glow bg-primary' : 'bg-primary hover:bg-primary/90'}`} onClick={handleAnalyzeManual} disabled={isProcessing || !manualTicket || !manualTitle}>
                                {isProcessing ? "Llamando a la API..." : "Analizar Ticket"}
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="csv" className="space-y-3 flex-1 flex flex-col justify-between min-h-0 mt-0">
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            className={`border-2 border-dashed rounded-lg p-3 flex flex-col items-center justify-center flex-1 transition-all duration-500 cursor-pointer min-h-0 ${selectedFile ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50 bg-muted/10'}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => { if (e.target.files && e.target.files.length > 0) setSelectedFile(e.target.files[0]); }}
                                accept=".csv"
                                className="hidden"
                            />
                            {selectedFile ? (
                                <>
                                    <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500 mb-2"><FileSpreadsheet size={20} /></div>
                                    <p className="text-[11px] font-bold text-emerald-500 mb-1 truncate max-w-[200px] text-center leading-tight">{selectedFile.name}</p>
                                    <p className="text-[9px] text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                </>
                            ) : (
                                <>
                                    <div className="p-2 rounded-full bg-primary/10 text-primary mb-2"><UploadCloud size={20} /></div>
                                    <p className="text-[11px] font-bold text-foreground mb-1">Arrastrar archivo .csv</p>
                                    <Button variant="secondary" size="sm" className="h-7 text-[10px] pointer-events-none px-3 py-0 mt-3">Explorar Archivos</Button>
                                </>
                            )}
                        </div>

                        <div className="shrink-0 space-y-1.5 min-h-[40px]">
                            {processedCount > 0 && (
                                <div className="p-2.5 rounded-lg bg-muted/30 border border-border">
                                    <div className="flex justify-between text-[9px] font-bold text-muted-foreground mb-1">
                                        <span>{processedCount.toLocaleString()} / {totalInCsv.toLocaleString()} procesados</span>
                                        <span className="text-primary">{progressValue}%</span>
                                    </div>
                                    <Progress value={progressValue} className="h-1 bg-secondary [&>div]:bg-primary transition-all duration-500" />
                                </div>
                            )}
                        </div>
                        <Button size="sm" variant="outline" className={`shrink-0 w-full font-bold border-border hover:bg-muted rounded-lg mt-1 h-8 text-[10px] ${isProcessing && 'animate-pulse-glow border-primary'}`} onClick={handleProcessCSV} disabled={isProcessing || !selectedFile}>
                            {isProcessing ? "Entrenando Motor..." : "Entrenar y Procesar"}
                        </Button>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}