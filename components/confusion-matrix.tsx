"use client";

import { useState } from "react";
import { mockConfusionMatrixData, type TicketCategory } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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

export function ConfusionMatrix() {
  const [hoveredCell, setHoveredCell] = useState<{ actual: string; predicted: string; count: number } | null>(null);
  
  // Build matrix data
  const matrix: Record<string, Record<string, number>> = {};
  let maxCount = 0;
  
  categories.forEach(actual => {
    matrix[actual] = {};
    categories.forEach(predicted => {
      const entry = mockConfusionMatrixData.find(
        d => d.actual === actual && d.predicted === predicted
      );
      const count = entry?.count || 0;
      matrix[actual][predicted] = count;
      if (count > maxCount) maxCount = count;
    });
  });

  const getColor = (count: number, isDiagonal: boolean) => {
    if (count === 0) return "bg-muted/30";
    
    const intensity = count / maxCount;
    
    if (isDiagonal) {
      // True positives - Neo-Red gradient
      if (intensity > 0.7) return "bg-primary";
      if (intensity > 0.4) return "bg-primary/70";
      return "bg-primary/40";
    } else {
      // False predictions - Gray scale
      if (intensity > 0.3) return "bg-muted-foreground/30";
      return "bg-muted/50";
    }
  };

  return (
    <div className="relative">
      {/* Matrix Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[500px]">
          {/* Header row - Predictions */}
          <div className="flex">
            <div className="w-20 h-8" /> {/* Corner spacer */}
            <div className="flex-1 flex">
              {categories.map(cat => (
                <div 
                  key={cat} 
                  className="flex-1 text-center text-xs font-medium text-muted-foreground px-1 truncate"
                  title={categoryLabels[cat]}
                >
                  {categoryLabels[cat].slice(0, 4)}
                </div>
              ))}
            </div>
          </div>
          
          {/* Label for X axis */}
          <div className="flex justify-center mb-2">
            <span className="text-xs text-muted-foreground">Predicho</span>
          </div>
          
          <div className="flex">
            {/* Y axis label */}
            <div className="flex items-center mr-1">
              <span className="text-xs text-muted-foreground -rotate-90 whitespace-nowrap">Real</span>
            </div>
            
            <div className="flex-1">
              {categories.map(actual => (
                <div key={actual} className="flex items-center">
                  {/* Row label */}
                  <div className="w-16 text-right pr-2 text-xs font-medium text-muted-foreground truncate" title={categoryLabels[actual]}>
                    {categoryLabels[actual].slice(0, 6)}
                  </div>
                  
                  {/* Cells */}
                  <div className="flex-1 flex gap-1 mb-1">
                    {categories.map(predicted => {
                      const count = matrix[actual][predicted];
                      const isDiagonal = actual === predicted;
                      
                      return (
                        <motion.div
                          key={`${actual}-${predicted}`}
                          className={cn(
                            "flex-1 aspect-square rounded-sm flex items-center justify-center cursor-pointer transition-all duration-200",
                            getColor(count, isDiagonal),
                            isDiagonal && count > 0 && "text-primary-foreground",
                            !isDiagonal && "text-foreground/70"
                          )}
                          whileHover={{ scale: 1.15, zIndex: 10 }}
                          onHoverStart={() => setHoveredCell({ actual, predicted, count })}
                          onHoverEnd={() => setHoveredCell(null)}
                        >
                          <span className="text-xs font-medium">
                            {count > 0 ? count : ""}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tooltip */}
      <AnimatePresence>
        {hoveredCell && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-0 right-0 bg-card border border-border rounded-lg p-3 shadow-lg z-20"
          >
            <div className="text-sm space-y-1">
              <div className="text-foreground font-medium">
                {hoveredCell.count} tickets
              </div>
              <div className="text-muted-foreground text-xs">
                Real: <span className="text-foreground">{categoryLabels[hoveredCell.actual as TicketCategory]}</span>
              </div>
              <div className="text-muted-foreground text-xs">
                Predicho: <span className="text-foreground">{categoryLabels[hoveredCell.predicted as TicketCategory]}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
