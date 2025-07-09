"use client"

import Link from "next/link"
import { useUser } from "@/hooks/useUser"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

const Dashboard = () => {
  const { user, isLoading, error } = useUser()

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4 text-red-600">Error</h1>
        <p className="text-xl text-gray-800 mb-6">{error.toString()}</p>
        <Link href="/" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors">
          Go Back Home
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-800">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">User Not Found</h1>
        <p className="text-xl text-gray-600 mb-6">
          We couldn't find your user information. Please try logging in again.
        </p>
        <Link href="/login" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors">
          Log In
        </Link>
      </div>
    )
  }

  const room = user.user.room || []

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <DashboardContent rooms={room} />
    </div>
  )
}

export default function DashboardPage() {
  return (
      <Dashboard />
  )
}
