"use client"

import Link from "next/link"
import { useAuth } from "@/providers/auth-provider"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user || !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <h1 className="mb-2 text-2xl font-semibold text-foreground">We couldn&apos;t find your account</h1>
        <p className="mb-6 max-w-sm text-muted-foreground">Your session may have expired. Please sign in again.</p>
        <Link href="/auth/signin">
          <Button>Sign in</Button>
        </Link>
      </div>
    )
  }

  const rooms = user.room || []

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <DashboardContent rooms={rooms} userName={user.name} />
    </div>
  )
}

export default function DashboardPage() {
  return (
      <Dashboard />
  )
}
