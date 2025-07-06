"use server"
import type { LoginSchema, RegisterSchema } from "@repo/common/types"
import type { z } from "zod"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_HTTP_URL || "http://localhost:3001"

export async function signUp(values: z.infer<typeof RegisterSchema>) {
  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })
    
    const data = await response.json()
    
    // Check if there's an error in the response data
    if (data.error) {
      return { error: data.error }
    }
    
    return { success: true, user: data.user }
  } catch (error) {
    return { error: "Network error. Please try again." }
  }
}

export async function signIn(values: z.infer<typeof LoginSchema>) {
  try {
    const response = await fetch(`${API_URL}/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })
    
    const data = await response.json()
    
    // Check if there's an error in the response data
    if (data.error) {
      return { error: data.error }
    }
    
    // Store token in httpOnly cookie for security
    const cookieStore = await cookies()
    cookieStore.set("token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
    
    return { success: true, token: data.token }
  } catch (error) {
    return { error: "Network error. Please try again." }
  }
}

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
        "Authorization": token, // Your backend expects just the token, not Bearer format
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