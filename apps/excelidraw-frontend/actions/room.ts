"use client"
import type { CreateRoomSchema } from "@repo/common/types"
import type { z } from "zod"

const API_URL = process.env.NEXT_PUBLIC_HTTP_URL || "http://localhost:3001"

export async function createRoom(values: z.infer<typeof CreateRoomSchema>) {
  try {
    const token = localStorage.getItem("token")
    
    if (!token) {
      return { error: "Authentication required" }
    }
    
    const response = await fetch(`${API_URL}/room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(values),
    })
    
    const data = await response.json()
    
    if (data.error) {
      return { error: data.error }
    }
    
    return { success: true, room: data.room }
  } catch (error) {
    return { error: "Network error. Please try again." }
  }
}

export async function getRoom(roomName: string) {
  try {
    const response = await fetch(`${API_URL}/room/${roomName}`, {
      method: "GET",
    })
    
    console.log("Fetching room:", roomName)
    
    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error)
    }
    
    return data.room
  } catch (error) {
    throw error
  }
}