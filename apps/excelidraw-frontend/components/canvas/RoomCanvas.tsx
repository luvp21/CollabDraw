"use client"

import { useEffect, useState } from "react"
import { Canvas } from "./canvas"
import { Toolbar } from "@/components/Toolbar"

export const RoomCanvas = ({ roomId, room }: { roomId: string, room: any }) => {
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
    return <div>Connecting to WebSocket...</div>
  }

  return (
    <Canvas roomId={roomId} socket={socket} room={room} />
  )
}
