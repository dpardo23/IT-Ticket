"use client"

import { Card } from "@/components/ui/card"
import { Terminal, Maximize2, X } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface TerminalPanelProps {
    logs: string[];
    isProcessing: boolean;
    terminalRef: React.RefObject<HTMLDivElement>;
}

export function TerminalPanel({ logs, isProcessing, terminalRef }: TerminalPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const expandedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isExpanded && expandedRef.current) {
            expandedRef.current.scrollTop = expandedRef.current.scrollHeight;
        }
    }, [logs, isExpanded]);

    const TerminalContent = ({ isModal = false }) => (
        <>
            <div className="bg-slate-200/50 dark:bg-[#1a1a1a] border-b border-border px-3 py-1.5 flex items-center justify-between transition-colors duration-700">
                <div className="flex items-center gap-2">
                    <Terminal size={isModal ? 14 : 10} className="text-slate-500 dark:text-gray-400 transition-colors" />
                    <span className={`font-mono text-slate-500 dark:text-gray-400 transition-colors ${isModal ? 'text-xs' : 'text-[9px]'}`}>
                        root@backend-api: /var/log/uvicorn.log
                    </span>
                </div>

                {!isModal && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 hover:bg-slate-300/50 dark:hover:bg-[#2a2a2a] rounded-sm transition-colors"
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
                    >
                        <Maximize2 size={10} className="text-slate-500 dark:text-gray-400" />
                    </Button>
                )}

                {isModal && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-red-500/20 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-400 rounded-md transition-colors"
                        onClick={() => setIsExpanded(false)}
                    >
                        <X size={16} />
                    </Button>
                )}
            </div>

            {/* whitespace-pre-wrap y break-words garantizan que el texto se envuelva y no se corte */}
            <div
                ref={isModal ? expandedRef : terminalRef}
                className={`flex-1 overflow-y-auto font-mono leading-relaxed transition-colors duration-700 whitespace-pre-wrap break-words ${isModal ? 'p-5 text-xs sm:text-[13px]' : 'p-2.5 text-[9px]'}`}
            >
                {logs.map((log, i) => (
                    <div key={i} className={`${log.includes("ERROR") || log.includes("CRITICAL") ? "text-red-600 dark:text-red-500" : log.includes("INFO") || log.includes("OK") || log.includes("SUCCESS") ? "text-green-600 dark:text-green-500" : "text-slate-700 dark:text-gray-300"}`}>
                        {log}
                    </div>
                ))}
                {isProcessing && <div className="text-green-600 dark:text-green-500 animate-pulse mt-0.5 block">_</div>}
            </div>
        </>
    );

    return (
        <>
            <Card
                className="shrink-0 bg-slate-50 dark:bg-[#0a0a0a] border-border shadow-md rounded-xl overflow-hidden h-[120px] flex flex-col cursor-pointer hover:border-primary/40 transition-all duration-300 group"
                onClick={() => !isExpanded && setIsExpanded(true)}
            >
                <TerminalContent />
            </Card>

            {isExpanded && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200"
                    onClick={() => setIsExpanded(false)}
                >
                    <div
                        className="w-full max-w-5xl h-[60vh] sm:h-[75vh] shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Card className="bg-slate-50 dark:bg-[#0a0a0a] border-border shadow-2xl rounded-xl overflow-hidden h-full flex flex-col ring-1 ring-primary/20">
                            <TerminalContent isModal={true} />
                        </Card>
                    </div>
                </div>
            )}
        </>
    )
}