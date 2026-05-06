"use client";

import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useAuth } from "@/lib/auth-context";
import { LoginScreen } from "@/components/login-screen";
import { UserPortal } from "@/components/user-portal";
import { HelpdeskWorkspace } from "@/components/helpdesk-workspace";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  // ESTO ES NUEVO: Le avisa a Tauri que quite la invisibilidad de la ventana
  useEffect(() => {
    invoke("show_main_window").catch(console.error);
  }, []);

  if (!isAuthenticated) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          // Aceleración por GPU
          className="will-change-transform transform-gpu"
        >
          <LoginScreen />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={user?.role || "default"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        // Aceleración por GPU
        className="transition-colors duration-300 will-change-transform transform-gpu"
      >
        {user?.role === "end_user" && <UserPortal />}
        {user?.role === "helpdesk" && <HelpdeskWorkspace />}
        {user?.role === "admin" && <AdminDashboard />}
      </motion.div>
    </AnimatePresence>
  );
}