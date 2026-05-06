"use client";

import { useState } from "react";
import { getPendingTickets, type Ticket, type TicketCategory, type TicketStatus } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Loader2, 
  CheckCheck,
  Shield,
  Database,
  Network,
  Mail,
  HardDrive,
  Settings,
  FileQuestion
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "./top-bar";
import { ConfidenceGauge } from "./confidence-gauge";
import { cn } from "@/lib/utils";

const statusConfig: Record<TicketStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  pending: { label: "Pendiente", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  in_progress: { label: "En Progreso", variant: "default", icon: <Loader2 className="h-3 w-3" /> },
  resolved: { label: "Resuelto", variant: "outline", icon: <CheckCheck className="h-3 w-3" /> },
  closed: { label: "Cerrado", variant: "outline", icon: <CheckCircle2 className="h-3 w-3" /> },
};

const categoryIcons: Record<TicketCategory, React.ReactNode> = {
  Hardware: <HardDrive className="h-5 w-5" />,
  Software: <Settings className="h-5 w-5" />,
  Network: <Network className="h-5 w-5" />,
  Database: <Database className="h-5 w-5" />,
  Security: <Shield className="h-5 w-5" />,
  Email: <Mail className="h-5 w-5" />,
  Other: <FileQuestion className="h-5 w-5" />,
};

const categories: TicketCategory[] = ["Hardware", "Software", "Network", "Database", "Security", "Email", "Other"];

const categoryLabels: Record<TicketCategory, string> = {
  Hardware: "Hardware",
  Software: "Software",
  Network: "Red",
  Database: "Base de Datos",
  Security: "Seguridad",
  Email: "Correo",
  Other: "Otro",
};

export function HelpdeskWorkspace() {
  const [tickets, setTickets] = useState<Ticket[]>(getPendingTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(tickets[0] || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConfirmTriage = async () => {
    if (!selectedTicket) return;
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setTickets(prev => prev.map(t => 
      t.id === selectedTicket.id 
        ? { ...t, status: "in_progress" as TicketStatus }
        : t
    ));
    
    setIsProcessing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleCategoryChange = (category: TicketCategory) => {
    if (!selectedTicket) return;
    
    setSelectedTicket(prev => prev ? { ...prev, category, predictedCategory: category } : null);
    setTickets(prev => prev.map(t => 
      t.id === selectedTicket.id 
        ? { ...t, category, predictedCategory: category }
        : t
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const requiresManualReview = selectedTicket && (selectedTicket.confidenceScore || 0) < 0.7;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Ticket List (Left/Center - 60%) */}
        <div className="flex-1 lg:w-3/5 border-r border-border overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border bg-card/50">
            <h2 className="font-semibold text-foreground">Bandeja de Tickets</h2>
            <p className="text-sm text-muted-foreground">{tickets.length} tickets requieren atención</p>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-card border-b border-border z-10">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="p-3 font-medium">ID</th>
                  <th className="p-3 font-medium">Asunto</th>
                  <th className="p-3 font-medium hidden md:table-cell">Usuario</th>
                  <th className="p-3 font-medium hidden lg:table-cell">Creado</th>
                  <th className="p-3 font-medium">Estado</th>
                  <th className="p-3 font-medium hidden sm:table-cell">Categoría IA</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => {
                  const status = statusConfig[ticket.status];
                  const isSelected = selectedTicket?.id === ticket.id;
                  const lowConfidence = (ticket.confidenceScore || 0) < 0.7;
                  
                  return (
                    <motion.tr
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={cn(
                        "border-b border-border cursor-pointer transition-colors",
                        isSelected 
                          ? "bg-primary/10" 
                          : "hover:bg-muted/50"
                      )}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td className="p-3">
                        <span className="font-mono text-sm text-muted-foreground">{ticket.id}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground truncate max-w-[200px]">
                            {ticket.subject}
                          </span>
                          {ticket.hasPII && (
                            <Badge variant="destructive" className="text-xs animate-soft-blink">
                              PII
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">{ticket.userName}</span>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">{formatDate(ticket.createdAt)}</span>
                      </td>
                      <td className="p-3">
                        <Badge variant={status.variant} className="text-xs flex items-center gap-1 w-fit">
                          {status.icon}
                          {status.label}
                        </Badge>
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <Badge variant={lowConfidence ? "secondary" : "outline"} className="text-xs">
                            {ticket.predictedCategory}
                          </Badge>
                          {lowConfidence && (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel (Right - 40%) */}
        <div className="lg:w-2/5 overflow-auto bg-card/30">
          <AnimatePresence mode="wait">
            {selectedTicket ? (
              <motion.div
                key={selectedTicket.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-4 space-y-4"
              >
                {/* Ticket Content */}
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                      <span className="font-mono text-sm text-muted-foreground">{selectedTicket.id}</span>
                    </div>
                    <CardDescription>
                      From {selectedTicket.userName} on {formatDate(selectedTicket.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {selectedTicket.description}
                    </p>
                    
                    {selectedTicket.hasPII && (
                      <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 animate-soft-blink">
                        <Shield className="h-4 w-4 text-destructive" />
                        <span className="text-sm text-destructive">
                          Datos Ofuscados por Seguridad (PII Detectado)
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* AI Prediction Widget */}
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      Clasificación IA
                      {requiresManualReview && (
                        <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                          Requiere Revisión Manual
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <ConfidenceGauge 
                      value={(selectedTicket.confidenceScore || 0) * 100} 
                      showWarning={requiresManualReview}
                    />
                    
                    <div className="mt-4 flex items-center gap-3 text-foreground">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {categoryIcons[selectedTicket.predictedCategory || "Other"]}
                      </div>
                      <span className="text-xl font-semibold">
                        {categoryLabels[selectedTicket.predictedCategory || "Other"]}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Panel */}
                <Card className="border-border">
                  <CardContent className="pt-4 space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Modificar Categoría</label>
                      <Select 
                        value={selectedTicket.category} 
                        onValueChange={(value) => handleCategoryChange(value as TicketCategory)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>
                              <div className="flex items-center gap-2">
                                {categoryIcons[cat]}
                                {categoryLabels[cat]}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button
                      onClick={handleConfirmTriage}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : showSuccess ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Triaje Confirmado!
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Confirmar Triaje
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Seleccione un ticket para ver los detalles
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
