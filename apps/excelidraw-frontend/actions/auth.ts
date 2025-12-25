"use server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_HTTP_URL || "http://localhost:3001"

export async function getUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      throw new Error("No token found")
    }

    const response = await fetch(`${API_URL}/user`, {
      method: "GET",
      headers: {
        "Authorization": token,
      },
    })

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error)
    }

    return data.user
  } catch (error) {
    throw error
  }
}

export async function signOut() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("token")
    return { success: true }
  } catch (error) {
    return { error: "Failed to sign out" }
  }
}

