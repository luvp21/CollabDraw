"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/types/user"
import { getUser } from "@/actions/auth"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      // Fetch user data directly from API using localStorage token
      const API_URL = process.env.NEXT_PUBLIC_HTTP_URL || "http://localhost:3001"
      const response = await fetch(`${API_URL}/user`, {
        method: "GET",
        headers: {
          "Authorization": token,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user")
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setUser(data.user)
    } catch (error) {
      console.error("Error fetching user:", error)
      localStorage.removeItem("token")
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = (token: string) => {
    localStorage.setItem("token", token)
    refreshUser()
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
