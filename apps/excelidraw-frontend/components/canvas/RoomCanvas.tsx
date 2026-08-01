"use client"

import { useEffect, useState } from "react"
import { Canvas } from "./canvas"
import type { Room } from "@/lib/drawing-engine"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export const RoomCanvas = ({ roomId, room }: { roomId: string, room: Room }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`)

    const handleOpen = () => {
      setSocket(ws)

      const data = JSON.stringify({
        type: "join_room",
        roomId
      })

      ws.send(data)
    }

    ws.addEventListener("open", handleOpen)

    return () => {
      ws.removeEventListener("open", handleOpen)

      if (ws.readyState === WebSocket.OPEN) {
        const leaveData = JSON.stringify({
          type: "leave_room"
        })

        ws.send(leaveData)
        ws.close()
      } else {
        // if not open, just close without sending
        ws.close()
      }
    }
  }, [roomId])

  if (!socket) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-white text-gray-500">
        <LoadingSpinner size="lg" className="text-blue-500" />
        <p className="text-sm">Connecting to room…</p>
      </div>
    )
  }

  return (
    <Canvas roomId={roomId} socket={socket} room={room} />
  )
}
