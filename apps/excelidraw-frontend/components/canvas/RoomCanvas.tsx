"use client"

import { useEffect, useState } from "react"
import { Canvas } from "./canvas"
import type { Room } from "@/lib/drawing-engine"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export const RoomCanvas = ({ roomId, room }: { roomId: string, room: Room }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isReconnecting, setIsReconnecting] = useState(false)

  useEffect(() => {
    let cancelled = false
    let ws: WebSocket
    let reconnectTimer: ReturnType<typeof setTimeout>

    const connect = () => {
      const token = localStorage.getItem("token")
      ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`)

      ws.addEventListener("open", () => {
        if (cancelled) return

        setSocket(ws)
        setIsReconnecting(false)
        ws.send(JSON.stringify({ type: "join_room", roomId }))
      })

      // The socket can drop silently (idle timeout, network blip, server
      // restart). Without this, send() on the dead socket is a silent
      // no-op and the app looks "connected" while nothing syncs.
      ws.addEventListener("close", () => {
        if (cancelled) return

        setSocket(null)
        setIsReconnecting(true)
        reconnectTimer = setTimeout(connect, 2000)
      })

      ws.addEventListener("error", () => {
        ws.close()
      })
    }

    connect()

    return () => {
      cancelled = true
      clearTimeout(reconnectTimer)

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "leave_room" }))
        ws.close()
      } else {
        ws.close()
      }
    }
  }, [roomId])

  if (!socket) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-white text-gray-500">
        <LoadingSpinner size="lg" className="text-blue-500" />
        <p className="text-sm">{isReconnecting ? "Reconnecting…" : "Connecting to room…"}</p>
      </div>
    )
  }

  return (
    <Canvas roomId={roomId} socket={socket} room={room} />
  )
}
