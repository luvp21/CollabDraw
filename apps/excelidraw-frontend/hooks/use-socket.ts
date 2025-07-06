"use client"

import { useEffect, useState } from "react"

interface UseSocketReturn {
  socket: WebSocket | null
  isConnected: boolean
  error: string | null
}

export function useSocket(roomId: string): UseSocketReturn {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!roomId) return

    const token = localStorage.getItem("token")
    if (!token) {
      setError("Authentication required")
      return
    }

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log("WebSocket connected")
      setSocket(ws)
      setIsConnected(true)
      setError(null)

      // Join the room
      ws.send(
        JSON.stringify({
          type: "join_room",
          roomId: roomId,
        }),
      )
    }

    ws.onclose = () => {
      console.log("WebSocket disconnected")
      setIsConnected(false)
      setSocket(null)
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
      setError("Connection failed")
      setIsConnected(false)
    }

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "leave_room",
            roomId: roomId,
          }),
        )
        ws.close()
      }
    }
  }, [roomId])

  return { socket, isConnected, error }
}
