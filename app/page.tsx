"use client"

import AIPlayground from "@/components/ai-playground"
import { useTheme } from "next-themes"
import { Moon, Sun, Users, BookOpen, GitBranch, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="w-9 h-9"></div>

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative overflow-hidden border-primary/50 hover:bg-primary/10 transition-colors shadow-sm w-9 h-9 rounded-xl"
    >
      <Sun className="h-4 w-4 text-amber-500 absolute transition-all duration-500 ease-in-out rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
      <Moon className="h-4 w-4 text-blue-500 absolute transition-all duration-500 ease-in-out rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

export default function Home() {
  return (
    <main className="h-screen w-full overflow-hidden bg-background text-foreground flex flex-col transition-colors duration-700 ease-in-out">

      {/* Encabezado Superior */}
      <header className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-border bg-card/80 backdrop-blur-md z-50 shadow-sm transition-colors duration-700 ease-in-out">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center animate-pulse-glow">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground"><path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" /></svg>
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-primary transition-colors duration-700">
              Pipeline NLP: Triaje Automático
            </h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest transition-colors duration-700">
              Universidad Mayor de San Simón • Inteligencia Artificial
            </p>
          </div>
        </div>

        <div className="flex items-center border-l pl-4 border-border transition-colors duration-700">
          <ThemeSwitcher />
        </div>
      </header>

      {/* Contenedor del Cuerpo */}
      <div className="flex-1 min-h-0 w-full max-w-[1800px] mx-auto p-4 flex flex-col gap-4">

        {/* BANNER DE INFORMACIÓN (Tarjetas ultradelgadas y elegantes) */}
        <div className="shrink-0 grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4 animate-fade-up">

          <Card className="bg-card border-border shadow-sm flex flex-row items-center py-2.5 px-3 gap-3 transition-colors duration-700 h-[48px]">
            <div className="p-1.5 bg-primary/10 rounded-md text-primary shrink-0"><Users size={14} /></div>
            <div className="flex flex-col min-w-0 justify-center">
              <p className="text-[8px] text-muted-foreground font-semibold uppercase tracking-wider leading-none mb-1">Equipo</p>
              <p className="text-[11px] font-medium text-foreground truncate leading-none">GRUPO 1</p>
            </div>
          </Card>

          <Card className="bg-card border-border shadow-sm flex flex-row items-center py-2.5 px-3 gap-3 transition-colors duration-700 h-[48px]">
            <div className="p-1.5 bg-primary/10 rounded-md text-primary shrink-0"><BookOpen size={14} /></div>
            <div className="flex flex-col min-w-0 justify-center">
              <p className="text-[8px] text-muted-foreground font-semibold uppercase tracking-wider leading-none mb-1">Área</p>
              <p className="text-[11px] font-medium text-foreground truncate leading-none">APRENDIZAJE SUPERVISADO</p>
            </div>
          </Card>

          <Card className="bg-card border-border shadow-sm flex flex-row items-center py-2.5 px-3 gap-3 transition-colors duration-700 h-[48px]">
            <div className="p-1.5 bg-primary/10 rounded-md text-primary shrink-0"><GitBranch size={14} /></div>
            <div className="flex flex-col min-w-0 justify-center">
              <p className="text-[8px] text-muted-foreground font-semibold uppercase tracking-wider leading-none mb-1">Subárea</p>
              <p className="text-[11px] font-medium text-foreground truncate leading-none">CLASIFICACIÓN / OPTIMIZACIÓN</p>
            </div>
          </Card>

          <Card className="bg-card border-border shadow-sm flex flex-row items-center py-2.5 px-3 gap-3 transition-colors duration-700 h-[48px]">
            <div className="p-1.5 bg-primary/10 rounded-md text-primary shrink-0"><AlertTriangle size={14} /></div>
            <div className="flex flex-col min-w-0 justify-center">
              <p className="text-[8px] text-muted-foreground font-semibold uppercase tracking-wider leading-none mb-1">Problema</p>
              <p className="text-[11px] font-medium text-foreground truncate leading-none">CLASIFICACIÓN DE TICKETS</p>
            </div>
          </Card>

        </div>

        {/* CONTENEDOR DEL PLAYGROUND */}
        <div className="flex-1 min-h-0 animate-fade-up">
          <AIPlayground />
        </div>

      </div>
    </main>
  )
}