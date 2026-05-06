"use client";

import { useState } from "react";
import { 
  mockDashboardStats, 
  mockF1ScoreData, 
  mockDepartmentLoadData,
} from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  TicketCheck, 
  Brain, 
  AlertTriangle,
  TrendingUp,
  Save,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { TopBar } from "./top-bar";
import { CountUp } from "./count-up";
import { ConfusionMatrix } from "./confusion-matrix";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--border))",
];

const departmentLabels: Record<string, string> = {
  Hardware: "Hardware",
  Software: "Software",
  Network: "Red",
  Database: "Base de Datos",
  Security: "Seguridad",
  Email: "Correo",
  Other: "Otro",
};

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  trend?: number;
  delay?: number;
}

function StatCard({ title, value, suffix = "", icon, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="border-border hover:shadow-md transition-all duration-200 hover:-translate-y-1">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
            {trend !== undefined && (
              <Badge variant={trend >= 0 ? "default" : "destructive"} className="text-xs">
                <TrendingUp className={`h-3 w-3 mr-1 ${trend < 0 ? "rotate-180" : ""}`} />
                {Math.abs(trend)}%
              </Badge>
            )}
          </div>
          <div className="mt-3">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">
              <CountUp value={value} suffix={suffix} decimals={suffix === "%" ? 1 : 0} />
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function AdminDashboard() {
  const [confidenceThreshold, setConfidenceThreshold] = useState(mockDashboardStats.confidenceThreshold);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const handleSaveThreshold = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  // Format F1 data for chart
  const f1ChartData = mockF1ScoreData.map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
    f1Score: d.f1Score * 100,
    precision: d.precision * 100,
    recall: d.recall * 100,
  }));

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      
      <main className="p-4 lg:p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="MTTA Promedio"
            value={mockDashboardStats.avgMTTA}
            suffix=" min"
            icon={<Clock className="h-5 w-5" />}
            trend={-12}
            delay={0}
          />
          <StatCard
            title="Tickets Hoy"
            value={mockDashboardStats.ticketsToday}
            icon={<TicketCheck className="h-5 w-5" />}
            delay={0.1}
          />
          <StatCard
            title="Exactitud del Modelo"
            value={mockDashboardStats.modelAccuracy}
            suffix="%"
            icon={<Brain className="h-5 w-5" />}
            trend={3}
            delay={0.2}
          />
          <StatCard
            title="Revisión Manual Requerida"
            value={mockDashboardStats.indeterminateTickets}
            icon={<AlertTriangle className="h-5 w-5" />}
            delay={0.3}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* F1 Score Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Rendimiento del Modelo (F1 Score)</CardTitle>
                <CardDescription>Métricas históricas de exactitud de los últimos 15 días</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={f1ChartData}>
                      <defs>
                        <linearGradient id="f1Gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis 
                        dataKey="date" 
                        className="text-muted-foreground"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                      />
                      <YAxis 
                        domain={[75, 100]} 
                        className="text-muted-foreground"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, ""]}
                      />
                      <Area
                        type="monotone"
                        dataKey="f1Score"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        fill="url(#f1Gradient)"
                        name="F1 Score"
                      />
                      <Line
                        type="monotone"
                        dataKey="precision"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={1.5}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Precision"
                      />
                      <Line
                        type="monotone"
                        dataKey="recall"
                        stroke="hsl(var(--chart-3))"
                        strokeWidth={1.5}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Recall"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-chart-1" />
                    <span className="text-sm text-muted-foreground">F1 Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-chart-2" style={{ borderStyle: "dashed" }} />
                    <span className="text-sm text-muted-foreground">Precision</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-chart-3" style={{ borderStyle: "dashed" }} />
                    <span className="text-sm text-muted-foreground">Recall</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Distribution Donut Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card className="border-border h-full">
              <CardHeader>
                <CardTitle className="text-base">Distribución de Tickets</CardTitle>
                <CardDescription>Volumen por departamento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockDepartmentLoadData}
                        dataKey="count"
                        nameKey="department"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {mockDepartmentLoadData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                        formatter={(value: number, name: string) => [value, departmentLabels[name] || name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {mockDepartmentLoadData.slice(0, 4).map((item, index) => (
                    <div key={item.department} className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: CHART_COLORS[index] }}
                      />
                      <span className="text-xs text-muted-foreground truncate">
                        {departmentLabels[item.department] || item.department} ({item.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Confusion Matrix */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Matriz de Confusión</CardTitle>
                <CardDescription>Exactitud de predicción del modelo por categoría</CardDescription>
              </CardHeader>
              <CardContent>
                <ConfusionMatrix />
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Calibration Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Calibración de IA</CardTitle>
                <CardDescription>Ajusta el umbral de confianza para el triaje automático</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Umbral de Confianza</span>
                    <span className="text-2xl font-bold text-primary">{confidenceThreshold}%</span>
                  </div>
                  
                  <div className="relative pt-2">
                    <Slider
                      value={[confidenceThreshold]}
                      onValueChange={([value]) => setConfidenceThreshold(value)}
                      min={50}
                      max={95}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-muted-foreground">50%</span>
                      <span className="text-xs text-muted-foreground">95%</span>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-foreground font-medium">Análisis de Impacto</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>
                        <span className="text-foreground font-medium">Umbral menor:</span> Más tickets auto-asignados, respuesta más rápida, mayor riesgo de error
                      </p>
                      <p>
                        <span className="text-foreground font-medium">Umbral mayor:</span> Más revisiones manuales, mejor exactitud, respuesta inicial más lenta
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSaveThreshold}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : showSaveSuccess ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Umbral Actualizado!
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Configuración
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
