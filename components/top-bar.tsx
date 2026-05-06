"use client";

import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Menu, X, TicketCheck } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserRole } from "@/lib/mock-data";

const roleLabels: Record<UserRole, string> = {
  end_user: "Portal de Usuario",
  helpdesk: "Espacio de Trabajo Helpdesk",
  admin: "Panel de Administración",
};

const navItems: Record<UserRole, { label: string; href: string }[]> = {
  end_user: [
    { label: "Nuevo Ticket", href: "#new" },
    { label: "Mis Tickets", href: "#history" },
  ],
  helpdesk: [
    { label: "Bandeja de Entrada", href: "#inbox" },
    { label: "Asignados", href: "#assigned" },
  ],
  admin: [
    { label: "Resumen", href: "#overview" },
    { label: "Analítica", href: "#analytics" },
    { label: "Configuración de IA", href: "#settings" },
  ],
};

export function TopBar() {
  const { user, logout, switchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const currentNavItems = navItems[user.role];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <TicketCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold text-foreground">IT Ticket AI</h1>
            <p className="text-xs text-muted-foreground">{roleLabels[user.role]}</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {currentNavItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden sm:inline text-sm">{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Cambiar Rol (Demo)
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => switchRole("end_user")}>
                Portal de Usuario
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchRole("helpdesk")}>
                Espacio de Trabajo Helpdesk
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchRole("admin")}>
                Panel de Administración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-border overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-1">
              {currentNavItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="justify-start"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
