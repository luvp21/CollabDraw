"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { StrokeWidth, StrokeColor, FillColor } from "@/types/canvas"
import { motion } from "framer-motion"

const strokeColors: StrokeColor[] = [
  "#1e1e1e",
  "#e03131",
  "#2f9e44",
  "#1971c2",
  "#f08c00",
  "#9c36b5",
]

const fillColors: FillColor[] = [
  "transparent",
  "#ffc9c9",
  "#b2f2bb",
  "#a5d8ff",
  "#ffec99",
  "#eebefa",
]

interface SidebarProps {
  strokeWidth: StrokeWidth
  onStrokeWidthChange: (width: StrokeWidth) => void
  strokeColor: StrokeColor
  onStrokeColorChange: (color: StrokeColor) => void
  fillColor: FillColor
  onFillColorChange: (color: FillColor) => void
}

function ColorSwatch({
  color,
  selected,
  onClick,
  label,
}: {
  color: string
  selected: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={selected}
      className={cn(
        "relative h-7 w-7 rounded-md border transition-all",
        selected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-foreground/30"
      )}
      style={{ backgroundColor: color === "transparent" ? "hsl(var(--card))" : color }}
    >
      {color === "transparent" && (
        <svg viewBox="0 0 28 28" className="absolute inset-0 h-full w-full text-destructive/70">
          <line x1="5" y1="23" x2="23" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
    </button>
  )
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
    <div className="absolute left-4 top-1/2 z-20 -translate-y-1/2">
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
        <Card className="w-56 rounded-xl border-border bg-card/95 shadow-[0_1px_2px_hsl(var(--foreground)/0.04),0_8px_20px_-8px_hsl(var(--foreground)/0.2)] backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground">Stroke width</Label>
                <span className="text-xs tabular-nums text-muted-foreground">{strokeWidth}px</span>
              </div>
              <Slider
                value={[strokeWidth]}
                onValueChange={(value) => onStrokeWidthChange(value[0] as StrokeWidth)}
                max={10}
                min={1}
                step={1}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Stroke color</Label>
              <div className="flex flex-wrap gap-2">
                {strokeColors.map((color) => (
                  <ColorSwatch
                    key={color}
                    color={color}
                    selected={strokeColor === color}
                    onClick={() => onStrokeColorChange(color)}
                    label={`Stroke color ${color}`}
                  />
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Fill color</Label>
              <div className="flex flex-wrap gap-2">
                {fillColors.map((color) => (
                  <ColorSwatch
                    key={color}
                    color={color}
                    selected={fillColor === color}
                    onClick={() => onFillColorChange(color)}
                    label={color === "transparent" ? "No fill" : `Fill color ${color}`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
