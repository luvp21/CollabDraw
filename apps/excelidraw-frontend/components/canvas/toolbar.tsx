"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MousePointer2, Square, Circle, Minus, Pencil, Eraser, Hand, Undo, Redo, Download, Share } from "lucide-react"
import type { Tool } from "@/types/canvas"
import { useState } from "react"
import { cn } from "@/lib/utils"

const tools: { id: Tool; icon: React.ReactNode; label: string; shortcut: string }[] = [
  { id: "select", icon: <MousePointer2 className="w-4 h-4" />, label: "Select", shortcut: "V" },
  { id: "rectangle", icon: <Square className="w-4 h-4" />, label: "Rectangle", shortcut: "R" },
  { id: "ellipse", icon: <Circle className="w-4 h-4" />, label: "Ellipse", shortcut: "O" },
  { id: "line", icon: <Minus className="w-4 h-4" />, label: "Line", shortcut: "L" },
  { id: "pencil", icon: <Pencil className="w-4 h-4" />, label: "Pencil", shortcut: "P" },
  { id: "eraser", icon: <Eraser className="w-4 h-4" />, label: "Eraser", shortcut: "E" },
  { id: "hand", icon: <Hand className="w-4 h-4" />, label: "Hand", shortcut: "H" },
]

export function Toolbar() {
  const [activeTool, setActiveTool] = useState<Tool>("select")

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center gap-1">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={activeTool === tool.id ? "default" : "ghost"}
              size="sm"
              className={cn("relative group", activeTool === tool.id && "bg-blue-100 text-blue-700 hover:bg-blue-200")}
              onClick={() => setActiveTool(tool.id)}
            >
              {tool.icon}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {tool.label} ({tool.shortcut})
              </div>
            </Button>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Action Tools */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="group relative">
            <Undo className="w-4 h-4" />
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              Undo
            </div>
          </Button>
          <Button variant="ghost" size="sm" className="group relative">
            <Redo className="w-4 h-4" />
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              Redo
            </div>
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Export Tools */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="group relative">
            <Download className="w-4 h-4" />
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              Export
            </div>
          </Button>
          <Button variant="ghost" size="sm" className="group relative">
            <Share className="w-4 h-4" />
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              Share
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}
