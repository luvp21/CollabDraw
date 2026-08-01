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
        className="bg-white/90 backdrop-blur rounded-xl shadow-lg shadow-black/5 border border-gray-200 px-2 py-1.5 flex items-center gap-2 text-xs text-gray-600"
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
        <span className="text-gray-300">•</span>
        <span>
          {shapeCount} shape{shapeCount !== 1 ? "s" : ""}
        </span>
        {selectedCount > 0 && (
          <>
            <span className="text-gray-300">•</span>
            <span>{selectedCount} selected</span>
          </>
        )}
      </motion.div>
    </div>
  )
}
