"use client";

import { motion } from "framer-motion";

interface ConfidenceGaugeProps {
  value: number; // 0-100
  size?: number;
  showWarning?: boolean;
}

export function ConfidenceGauge({ value, size = 120, showWarning = false }: ConfidenceGaugeProps) {
  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius; // Half circle
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  const getColor = () => {
    if (showWarning || value < 70) return "var(--chart-4)"; // Warning yellow/orange
    return "var(--neo-red)"; // Primary neo-red
  };

  return (
    <div className="relative" style={{ width: size, height: size / 2 + 30 }}>
      <svg
        width={size}
        height={size / 2 + 10}
        className="transform -rotate-0"
      >
        {/* Background arc */}
        <path
          d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/30"
        />
        
        {/* Value arc */}
        <motion.path
          d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
          fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            filter: showWarning ? "none" : "drop-shadow(0 0 6px var(--neo-red))",
          }}
        />
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
        <motion.span
          className="text-2xl font-bold text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(value)}%
        </motion.span>
        <span className="text-xs text-muted-foreground">Confidence</span>
      </div>
    </div>
  );
}
