"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MousePointer2, Square, Circle, Minus, Pencil, Eraser, Hand, Undo, Redo, Download, Link2 } from "lucide-react"
import type { Tool } from "@/types/canvas"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const tools: { id: Tool; icon: React.ReactNode; label: string; shortcut: string }[] = [
  { id: "select", icon: <MousePointer2 className="h-4 w-4" />, label: "Select", shortcut: "V" },
  { id: "rectangle", icon: <Square className="h-4 w-4" />, label: "Rectangle", shortcut: "R" },
  { id: "ellipse", icon: <Circle className="h-4 w-4" />, label: "Ellipse", shortcut: "O" },
  { id: "line", icon: <Minus className="h-4 w-4" />, label: "Line", shortcut: "L" },
  { id: "pencil", icon: <Pencil className="h-4 w-4" />, label: "Pencil", shortcut: "P" },
  { id: "eraser", icon: <Eraser className="h-4 w-4" />, label: "Eraser", shortcut: "E" },
  { id: "hand", icon: <Hand className="h-4 w-4" />, label: "Hand", shortcut: "H" },
]

interface ToolbarProps {
  activeTool: Tool
  onToolChange: (tool: Tool) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  onExport: () => void
  onShare: () => void
}

function ToolbarIconButton({
  label,
  onClick,
  disabled,
  active,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={active ? "default" : "ghost"}
          size="sm"
          className={cn("h-8 w-8 p-0", active && "bg-primary/10 text-primary hover:bg-primary/15")}
          onClick={onClick}
          disabled={disabled}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

export function Toolbar({ activeTool, onToolChange, onUndo, onRedo, canUndo, canRedo, onExport, onShare }: ToolbarProps) {
  return (
    <TooltipProvider delayDuration={200}>
      {/* Pushed below the room header on narrow screens so the two floating
          panels don't collide; the header only ever occupies the top-left. */}
      <div className="absolute left-1/2 top-[4.25rem] z-20 -translate-x-1/2 sm:top-4">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex max-w-[92vw] items-center gap-1 overflow-x-auto rounded-xl border border-border bg-card/95 p-1.5 shadow-[0_1px_2px_hsl(var(--foreground)/0.04),0_8px_20px_-8px_hsl(var(--foreground)/0.2)] backdrop-blur-md"
        >
          <div className="flex items-center gap-0.5">
            {tools.map((tool) => (
              <ToolbarIconButton
                key={tool.id}
                label={`${tool.label} (${tool.shortcut})`}
                active={activeTool === tool.id}
                onClick={() => onToolChange(tool.id)}
              >
                {tool.icon}
              </ToolbarIconButton>
            ))}
          </div>

          <Separator orientation="vertical" className="mx-1.5 h-6" />

          <div className="flex items-center gap-0.5">
            <ToolbarIconButton label="Undo (Ctrl+Z)" onClick={onUndo} disabled={!canUndo}>
              <Undo className="h-4 w-4" />
            </ToolbarIconButton>
            <ToolbarIconButton label="Redo (Ctrl+Shift+Z)" onClick={onRedo} disabled={!canRedo}>
              <Redo className="h-4 w-4" />
            </ToolbarIconButton>
          </div>

          <Separator orientation="vertical" className="mx-1.5 h-6" />

          <div className="flex items-center gap-0.5">
            <ToolbarIconButton label="Export as PNG" onClick={onExport}>
              <Download className="h-4 w-4" />
            </ToolbarIconButton>
            <ToolbarIconButton label="Copy room link" onClick={onShare}>
              <Link2 className="h-4 w-4" />
            </ToolbarIconButton>
          </div>
        </motion.div>
      </div>
    </TooltipProvider>
  )
}
