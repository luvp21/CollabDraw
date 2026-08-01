"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type { StrokeWidth, StrokeColor, FillColor } from "@/types/canvas"
import { motion } from "framer-motion"

const strokeColors: StrokeColor[] = [
  "#000000",
  "#ffffff",
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#ff00ff",
  "#00ffff",
  "#ffa500",
  "#800080",
]

const fillColors: FillColor[] = [
  "transparent",
  "#ffffff",
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#ff00ff",
  "#00ffff",
  "#ffa500",
  "#800080",
]

interface SidebarProps {
  strokeWidth: StrokeWidth
  onStrokeWidthChange: (width: StrokeWidth) => void
  strokeColor: StrokeColor
  onStrokeColorChange: (color: StrokeColor) => void
  fillColor: FillColor
  onFillColorChange: (color: FillColor) => void
}

export function Sidebar({
  strokeWidth,
  onStrokeWidthChange,
  strokeColor,
  onStrokeColorChange,
  fillColor,
  onFillColorChange,
}: SidebarProps) {
  return (
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20">
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
      <Card className="w-64 shadow-lg shadow-black/5 border-gray-200 bg-white/90 backdrop-blur rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Properties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-600">Stroke Width</Label>
            <div className="space-y-2">
              <Slider
                value={[strokeWidth]}
                onValueChange={(value) => onStrokeWidthChange(value[0] as StrokeWidth)}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-gray-500 text-center">{strokeWidth}px</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-600">Stroke Color</Label>
            <div className="grid grid-cols-5 gap-2">
              {strokeColors.map((color) => (
                <Button
                  key={color}
                  variant="outline"
                  size="sm"
                  className={`w-8 h-8 p-0 border-2 ${strokeColor === color ? "border-blue-500" : "border-gray-300"}`}
                  style={{ backgroundColor: color }}
                  onClick={() => onStrokeColorChange(color)}
                />
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-600">Fill Color</Label>
            <div className="grid grid-cols-5 gap-2">
              {fillColors.map((color) => (
                <Button
                  key={color}
                  variant="outline"
                  size="sm"
                  className={`w-8 h-8 p-0 border-2 relative ${
                    fillColor === color ? "border-blue-500" : "border-gray-300"
                  }`}
                  style={{
                    backgroundColor: color === "transparent" ? "#ffffff" : color,
                  }}
                  onClick={() => onFillColorChange(color)}
                >
                  {color === "transparent" && (
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-500 opacity-50 transform rotate-45 w-full h-0.5 top-1/2 left-0" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  )
}
