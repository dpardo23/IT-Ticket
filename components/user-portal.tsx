"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getTicketsByUserId, predictCategory, type Ticket, type TicketStatus } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Send, Clock, CheckCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "./top-bar";

const statusConfig: Record<TicketStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  pending: { label: "Pendiente", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  in_progress: { label: "En Progreso", variant: "default", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  resolved: { label: "Resuelto", variant: "outline", icon: <CheckCheck className="h-3 w-3" /> },
  closed: { label: "Cerrado", variant: "outline", icon: <CheckCircle2 className="h-3 w-3" /> },
};

const categoryLabels: Record<string, string> = {
  Hardware: "Hardware",
  Software: "Software",
  Network: "Red",
  Database: "Base de Datos",
  Security: "Seguridad",
  Email: "Correo",
  Other: "Otro",
};

export function UserPortal() {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>(() => 
    user ? getTicketsByUserId(user.id) : []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim() || !user) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Get AI prediction
    const prediction = predictCategory(description);

    // Create new ticket
    const newTicket: Ticket = {
      id: `T-${String(tickets.length + 9).padStart(3, "0")}`,
      subject,
      description,
      status: "pending",
      category: prediction.category,
      predictedCategory: prediction.category,
      confidenceScore: prediction.confidence,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      hasPII: false,
    };

    setTickets(prev => [newTicket, ...prev]);
    setSubject("");
    setDescription("");
    setIsSubmitting(false);
    setSubmitSuccess(true);

    // Reset success state after animation
    setTimeout(() => setSubmitSuccess(false), 3000);
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

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* New Ticket Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-border shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Crear Nuevo Ticket</CardTitle>
              <CardDescription>Describe tu problema y nuestra IA ayudará a categorizarlo</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-foreground">Asunto</Label>
                  <Input
                    id="subject"
                    placeholder="Resumen breve de tu problema"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-background"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Por favor describe tu problema en detalle. Incluye mensajes de error, pasos para reproducirlo y lo que ya has intentado."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[150px] bg-background resize-none"
                    disabled={isSubmitting}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
                  disabled={isSubmitting || !subject.trim() || !description.trim()}
                >
                  <AnimatePresence mode="wait">
                    {isSubmitting ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center"
                      >
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </motion.div>
                    ) : submitSuccess ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Ticket Creado!
                      </motion.div>
                    ) : (
                      <motion.div
                        key="default"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Ticket
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Ticket History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-8"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Mis Tickets</h2>
          
          {tickets.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-8 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Aún no tienes tickets. Crea tu primer ticket arriba.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
              
              <div className="space-y-4">
                <AnimatePresence>
                  {tickets.map((ticket, index) => {
                    const status = statusConfig[ticket.status];
                    return (
                      <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="relative pl-10"
                      >
                        {/* Timeline dot */}
                        <div className="absolute left-2.5 top-4 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                        
                        <Card className="border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
                                  <Badge variant={status.variant} className="text-xs flex items-center gap-1">
                                    {status.icon}
                                    {status.label}
                                  </Badge>
                                  {ticket.predictedCategory && (
                                    <Badge variant="outline" className="text-xs">
                                      {categoryLabels[ticket.predictedCategory] || ticket.predictedCategory}
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="font-medium text-foreground truncate">{ticket.subject}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                  {ticket.description}
                                </p>
                              </div>
                              <div className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDate(ticket.createdAt)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
