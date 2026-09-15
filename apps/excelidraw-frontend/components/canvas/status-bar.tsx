"use client"

import { Button } from "@/components/ui/button"
import { Minus, Plus, Maximize } from "lucide-react"
import { motion } from "framer-motion"

interface StatusBarProps {
  scale: number
  shapeCount: number
  selectedCount: number
  onZoomIn: () => void
  onZoomOut: () => void
  onFitToScreen: () => void
}

export function StatusBar({ scale, shapeCount, selectedCount, onZoomIn, onZoomOut, onFitToScreen }: StatusBarProps) {
  return (
    <div className="absolute bottom-4 left-4 z-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-center gap-2 rounded-xl border border-border bg-card/95 px-2 py-1.5 text-xs text-muted-foreground shadow-[0_1px_2px_hsl(var(--foreground)/0.04),0_8px_20px_-8px_hsl(var(--foreground)/0.2)] backdrop-blur-md"
      >
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onZoomOut} title="Zoom out">
          <Minus className="w-3.5 h-3.5" />
        </Button>
        <span className="min-w-[3rem] text-center tabular-nums">{scale}%</span>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onZoomIn} title="Zoom in">
          <Plus className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onFitToScreen} title="Fit to screen">
          <Maximize className="w-3.5 h-3.5" />
        </Button>
        <span className="text-border">•</span>
        <span>
          {shapeCount} shape{shapeCount !== 1 ? "s" : ""}
        </span>
        {selectedCount > 0 && (
          <>
            <span className="text-border">•</span>
            <span>{selectedCount} selected</span>
          </>
        )}
      </motion.div>
    </div>
  )
}
