"use client"
import { useEffect, useRef, useState } from "react"
import { DrawingEngine } from "@/lib/drawing-engine"
import type { Room } from "@/lib/drawing-engine"
import { Toolbar } from "./toolbar"
import { Sidebar } from "./sidebar"
import { StatusBar } from "./status-bar"
import { RoomHeader } from "./room-header"
import { useToast } from "@/hooks/use-toast"
import type { Tool, StrokeWidth, StrokeColor, FillColor } from "@/types/canvas"

interface CanvasProps {
  roomId: string
  socket: WebSocket
  room: Room
}

const SHAPE_TOOLS: Tool[] = ["rectangle", "ellipse", "line", "pencil"]

export function Canvas({ roomId, socket, room }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<DrawingEngine | null>(null)
  const { toast } = useToast()
  const [activeTool, setActiveTool] = useState<Tool>("select")
  const [strokeWidth, setStrokeWidth] = useState<StrokeWidth>(2)
  const [strokeColor, setStrokeColor] = useState<StrokeColor>("#000000")
  const [fillColor, setFillColor] = useState<FillColor>("transparent")
  const [scale, setScale] = useState(100)
  const [shapeCount, setShapeCount] = useState(0)
  const [selectedShapeIds, setSelectedShapeIds] = useState<string[]>([])

  // Initialize the drawing engine
  useEffect(() => {
    if (!canvasRef.current) return

    const initialShapes = room?.shape || []

    const engine = new DrawingEngine(
      canvasRef.current,
      roomId,
      socket,
      initialShapes,
      (newScale) => setScale(newScale),
      (shapeIds) => setSelectedShapeIds(shapeIds),
      (count) => setShapeCount(count)
    )
    engineRef.current = engine

    return () => {
      engine.destroy()
    }
  }, [roomId, socket, room])

  useEffect(() => {
    engineRef.current?.setTool(activeTool)
  }, [activeTool])

  useEffect(() => {
    engineRef.current?.setStrokeWidth(strokeWidth)
  }, [strokeWidth])

  useEffect(() => {
    engineRef.current?.setStrokeColor(strokeColor)
  }, [strokeColor])

  useEffect(() => {
    engineRef.current?.setFillColor(fillColor)
  }, [fillColor])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        case "z":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            if (e.shiftKey) {
              engineRef.current?.redo()
            } else {
              engineRef.current?.undo()
            }
          }
          break
        case "d":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            engineRef.current?.duplicateSelected()
          }
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleExport = () => {
    const engine = engineRef.current
    if (!engine) return

    const dataUrl = engine.exportCanvas()
    const link = document.createElement("a")
    link.href = dataUrl
    link.download = `${roomId}-drawing.png`
    link.click()

    toast({ title: "Exported", description: "Your drawing was downloaded as a PNG." })
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast({ title: "Link copied", description: "Room link copied to your clipboard." })
    } catch {
      toast({
        title: "Couldn't copy link",
        description: "Copy it from your address bar instead.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{
          cursor:
            activeTool === "hand"
              ? "grab"
              : activeTool === "eraser"
                ? "crosshair"
                : activeTool === "select"
                  ? "default"
                  : "crosshair",
        }}
      />

      <RoomHeader roomName={room.roomName} />

      <Toolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onUndo={() => engineRef.current?.undo()}
        onRedo={() => engineRef.current?.redo()}
        onExport={handleExport}
        onShare={handleShare}
      />

      {SHAPE_TOOLS.includes(activeTool) && (
        <Sidebar
          strokeWidth={strokeWidth}
          onStrokeWidthChange={setStrokeWidth}
          strokeColor={strokeColor}
          onStrokeColorChange={setStrokeColor}
          fillColor={fillColor}
          onFillColorChange={setFillColor}
        />
      )}

      <StatusBar
        scale={scale}
        shapeCount={shapeCount}
        selectedCount={selectedShapeIds.length}
        onZoomIn={() => engineRef.current?.zoomIn()}
        onZoomOut={() => engineRef.current?.zoomOut()}
        onFitToScreen={() => engineRef.current?.fitToScreen()}
      />
    </div>
  )
}
