export type Tool = "select" | "rectangle" | "ellipse" | "line" | "pencil" | "eraser" | "hand"

export type StrokeWidth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export type StrokeColor = string

export type FillColor = string | "transparent"

export interface Shape {
  id: string
  type: "rectangle" | "ellipse" | "line" | "pencil"
  x: number
  y: number
  width?: number
  height?: number
  points?: { x: number; y: number }[]
  strokeWidth: StrokeWidth
  strokeColor: StrokeColor
  fillColor: FillColor
  userId: string
  timestamp: number
}

export interface CanvasState {
  shapes: Shape[]
  selectedShapeIds: string[]
  tool: Tool
  strokeWidth: StrokeWidth
  strokeColor: StrokeColor
  fillColor: FillColor
  scale: number
  panX: number
  panY: number
}
