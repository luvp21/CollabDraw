"use client"

import { useEffect, useState, useRef } from "react"
import { Canvas } from "./canvas"
import { Toolbar } from "@/components/Toolbar"

export const RoomCanvas = ({roomId, room}: {roomId: string, room: any}) => {
    const [socket, setSocket] = useState<WebSocket | null>(null)
    const [isConnecting, setIsConnecting] = useState(true)
    const [connectionError, setConnectionError] = useState<string | null>(null)
    const wsRef = useRef<WebSocket | null>(null)

    useEffect(() => {
        const token = localStorage.getItem("token")

        if (!token) {
            setConnectionError("No authentication token found")
            setIsConnecting(false)
            return
        }

        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`)
        wsRef.current = ws

        ws.onopen = () => {
            console.log("WebSocket connected")
            setSocket(ws)
            setIsConnecting(false)
            setConnectionError(null)

            // Join the room
            const data = JSON.stringify({
                type: "join_room",
                roomId
            })
            ws.send(data)
        }

        ws.onclose = (event) => {
            console.log("WebSocket disconnected:", event.code, event.reason)
            setSocket(null)
            setIsConnecting(false)

            // Only show error if it wasn't a clean disconnect
            if (event.code !== 1000) {
                setConnectionError("Connection lost")
            }
        }

        ws.onerror = (error) => {
            console.error("WebSocket error:", error)
            setConnectionError("Failed to connect to server")
            setIsConnecting(false)
        }

        // Cleanup function
        return () => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                const leaveData = JSON.stringify({
                    type: "leave_room"
                })
                wsRef.current.send(leaveData)
                wsRef.current.close(1000, "Component unmounting")
            }
        }
    }, [roomId])

    if (isConnecting) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <div>Connecting to WebSocket...</div>
                </div>
            </div>
        )
    }

    if (connectionError) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center text-red-500">
                    <div className="text-lg font-semibold mb-2">Connection Error</div>
                    <div>{connectionError}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    if (!socket) {
        return (
            <div className="flex items-center justify-center h-full">
                <div>Unable to establish connection</div>
            </div>
        )
    }

    return (
        <Canvas roomId={roomId} socket={socket} room={room} />
    )
}
