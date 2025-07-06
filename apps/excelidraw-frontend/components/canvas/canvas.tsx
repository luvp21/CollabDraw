"use client"
import { useEffect, useRef, useState } from "react"
import { DrawingEngine } from "@/lib/drawing-engine"
import type { Tool, StrokeWidth, StrokeColor, FillColor } from "@/types/canvas"

interface CanvasProps {
  roomId: string
  socket: WebSocket
  room: any // Add room prop to match your usage
}

export function Canvas({ roomId, socket, room }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<DrawingEngine | null>(null)
  const [activeTool, setActiveTool] = useState<Tool>("select")
  const [strokeWidth, setStrokeWidth] = useState<StrokeWidth>(2)
  const [strokeColor, setStrokeColor] = useState<StrokeColor>("#000000")
  const [fillColor, setFillColor] = useState<FillColor>("transparent")
  const [scale, setScale] = useState(100) // Changed to match percentage format
  const [selectedShapeIds, setSelectedShapeIds] = useState<string[]>([])

  // Initialize the drawing engine
  useEffect(() => {
    if (!canvasRef.current) return

    // Get initial shapes from room data if available
    const initialShapes = room?.shapes || []

    const engine = new DrawingEngine(
      canvasRef.current,
      roomId,
      socket,
      initialShapes,
      (newScale) => setScale(newScale), // This receives percentage (e.g., 100)
      (shapeIds) => setSelectedShapeIds(shapeIds) // Selection callback
    )
    engineRef.current = engine

    return () => {
      engine.destroy()
    }
  }, [roomId, socket, room]) // Add room to dependencies

  // Update tool when activeTool changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setTool(activeTool)
    }
  }, [activeTool])

  // Update stroke width when strokeWidth changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setStrokeWidth(strokeWidth)
    }
  }, [strokeWidth])

  // Update stroke color when strokeColor changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setStrokeColor(strokeColor)
    }
  }, [strokeColor])

  // Update fill color when fillColor changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setFillColor(fillColor)
    }
  }, [fillColor])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case "v":
        case "1":
          setActiveTool("select")
          break
        case "r":
        case "2":
          setActiveTool("rectangle")
          break
        case "o":
        case "3":
          setActiveTool("ellipse")
          break
        case "l":
        case "4":
          setActiveTool("line")
          break
        case "p":
        case "5":
          setActiveTool("pencil")
          break
        case "e":
        case "6":
          setActiveTool("eraser")
          break
        case "h":
        case " ":
          e.preventDefault()
          setActiveTool("hand")
          break
        case "Delete":
        case "Backspace":
          // Let the engine handle deletion - it's already set up in the engine
          break
        case "Escape":
          // Let the engine handle escape - it's already set up in the engine
          break
        case "z":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            if (engineRef.current) {
              engineRef.current.undo()
            }
          }
          break
        case "d":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            if (engineRef.current) {
              engineRef.current.duplicateSelected()
            }
          }
          break
        case "a":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            // Select all shapes - you might want to implement this in the engine
          }
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Public methods to expose engine functionality
  const canvasActions = {
    resetCanvas: () => engineRef.current?.resetCanvas(),
    zoomIn: () => engineRef.current?.zoomIn(),
    zoomOut: () => engineRef.current?.zoomOut(),
    fitToScreen: () => engineRef.current?.fitToScreen(),
    exportCanvas: () => engineRef.current?.exportCanvas(),
    clearCanvas: () => engineRef.current?.clearCanvas(),
    undo: () => engineRef.current?.undo(),
    duplicateSelected: () => engineRef.current?.duplicateSelected(),
    getSelectedShapes: () => engineRef.current?.getSelectedShapes() || [],
    getShapeCount: () => engineRef.current?.getShapeCount() || 0,
    getZoom: () => engineRef.current?.getZoom() || 100,
    setZoom: (zoom: number) => engineRef.current?.setZoom(zoom),
    setTool: (tool: Tool) => {
      setActiveTool(tool)
      engineRef.current?.setTool(tool)
    },
    setStrokeWidth: (width: StrokeWidth) => {
      setStrokeWidth(width)
      engineRef.current?.setStrokeWidth(width)
    },
    setStrokeColor: (color: StrokeColor) => {
      setStrokeColor(color)
      engineRef.current?.setStrokeColor(color)
    },
    setFillColor: (color: FillColor) => {
      setFillColor(color)
      engineRef.current?.setFillColor(color)
    }
  }

  return (
    <div className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{
          cursor: activeTool === "hand" ? "grab" : 
                 activeTool === "eraser" ? "crosshair" : 
                 activeTool === "select" ? "default" : "crosshair"
        }}
      />
      
      {/* You can pass these values and actions to your toolbar/sidebar components */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        {/* Toolbar component can receive these props:
          - activeTool, setActiveTool
          - strokeWidth, setStrokeWidth
          - strokeColor, setStrokeColor
          - fillColor, setFillColor
          - scale
          - selectedShapeIds
          - canvasActions
        */}
      </div>
    </div>
  )
}