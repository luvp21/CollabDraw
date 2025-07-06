"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type { StrokeWidth, StrokeColor, FillColor } from "@/types/canvas"
import { useState } from "react"

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

export function Sidebar() {
  const [strokeWidth, setStrokeWidth] = useState<StrokeWidth>(2)
  const [strokeColor, setStrokeColor] = useState<StrokeColor>("#000000")
  const [fillColor, setFillColor] = useState<FillColor>("transparent")

  return (
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20">
      <Card className="w-64 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Properties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stroke Width */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-600">Stroke Width</Label>
            <div className="space-y-2">
              <Slider
                value={[strokeWidth]}
                onValueChange={(value) => setStrokeWidth(value[0] as StrokeWidth)}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-gray-500 text-center">{strokeWidth}px</div>
            </div>
          </div>

          <Separator />

          {/* Stroke Color */}
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
                  onClick={() => setStrokeColor(color)}
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* Fill Color */}
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
                  onClick={() => setFillColor(color)}
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
    </div>
  )
}
