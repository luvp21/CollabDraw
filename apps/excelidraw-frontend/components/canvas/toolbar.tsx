"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MousePointer2, Square, Circle, Minus, Pencil, Eraser, Hand, Undo, Redo, Download, Link2 } from "lucide-react"
import type { Tool } from "@/types/canvas"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const tools: { id: Tool; icon: React.ReactNode; label: string; shortcut: string }[] = [
  { id: "select", icon: <MousePointer2 className="w-4 h-4" />, label: "Select", shortcut: "V" },
  { id: "rectangle", icon: <Square className="w-4 h-4" />, label: "Rectangle", shortcut: "R" },
  { id: "ellipse", icon: <Circle className="w-4 h-4" />, label: "Ellipse", shortcut: "O" },
  { id: "line", icon: <Minus className="w-4 h-4" />, label: "Line", shortcut: "L" },
  { id: "pencil", icon: <Pencil className="w-4 h-4" />, label: "Pencil", shortcut: "P" },
  { id: "eraser", icon: <Eraser className="w-4 h-4" />, label: "Eraser", shortcut: "E" },
  { id: "hand", icon: <Hand className="w-4 h-4" />, label: "Hand", shortcut: "H" },
]

interface ToolbarProps {
  activeTool: Tool
  onToolChange: (tool: Tool) => void
  onUndo: () => void
  onRedo: () => void
  onExport: () => void
  onShare: () => void
}

export function Toolbar({ activeTool, onToolChange, onUndo, onRedo, onExport, onShare }: ToolbarProps) {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white/90 backdrop-blur rounded-xl shadow-lg shadow-black/5 border border-gray-200 p-2 flex items-center gap-1"
      >
        <div className="flex items-center gap-1">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={activeTool === tool.id ? "default" : "ghost"}
              size="sm"
              className={cn("relative group", activeTool === tool.id && "bg-blue-100 text-blue-700 hover:bg-blue-200")}
              onClick={() => onToolChange(tool.id)}
            >
              {tool.icon}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {tool.label} ({tool.shortcut})
              </div>
            </Button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6 mx-2" />

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="group relative" onClick={onUndo} title="Undo (Ctrl+Z)">
            <Undo className="w-4 h-4" />
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Undo
            </div>
          </Button>
          <Button variant="ghost" size="sm" className="group relative" onClick={onRedo} title="Redo (Ctrl+Shift+Z)">
            <Redo className="w-4 h-4" />
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Redo
            </div>
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 mx-2" />

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="group relative" onClick={onExport} title="Export as PNG">
            <Download className="w-4 h-4" />
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Export PNG
            </div>
          </Button>
          <Button variant="ghost" size="sm" className="group relative" onClick={onShare} title="Copy room link">
            <Link2 className="w-4 h-4" />
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Copy link
            </div>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
