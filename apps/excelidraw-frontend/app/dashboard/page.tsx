"use client"

import Link from "next/link"
import { useAuth } from "@/providers/auth-provider"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const Dashboard = () => {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-800">Loading...</div>
      </div>
    )
  }

  if (!user || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">User Not Found</h1>
        <p className="text-xl text-gray-600 mb-6">
          We couldn't find your user information. Please try logging in again.
        </p>
        <Link href="/auth/signin" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors">
          Sign In
        </Link>
      </div>
    )
  }

  const rooms = user.room || []

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <DashboardContent rooms={rooms} />
    </div>
  )
}

export default function DashboardPage() {
  return (
      <Dashboard />
  )
}
