"use client";

import { useAuth } from "@/lib/auth-context";
import { LoginScreen } from "@/components/login-screen";
import { UserPortal } from "@/components/user-portal";
import { HelpdeskWorkspace } from "@/components/helpdesk-workspace";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  // Not authenticated - show login
  if (!isAuthenticated) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LoginScreen />
        </motion.div>
      </AnimatePresence>
    );
  }

  // Render based on user role
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={user?.role || "default"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="transition-colors duration-300"
      >
        {user?.role === "end_user" && <UserPortal />}
        {user?.role === "helpdesk" && <HelpdeskWorkspace />}
        {user?.role === "admin" && <AdminDashboard />}
      </motion.div>
    </AnimatePresence>
  );
}
