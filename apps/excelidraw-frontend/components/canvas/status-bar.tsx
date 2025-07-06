"use client"

import { useState, useEffect } from "react"

export function StatusBar() {
  const [scale, setScale] = useState(100)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }

    document.addEventListener("mousemove", handleMouseMove)
    return () => document.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="absolute bottom-4 left-4 z-20">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 flex items-center gap-4 text-xs text-gray-600">
        <span>Zoom: {scale}%</span>
        <span>•</span>
        <span>
          X: {mousePos.x}, Y: {mousePos.y}
        </span>
      </div>
    </div>
  )
}
