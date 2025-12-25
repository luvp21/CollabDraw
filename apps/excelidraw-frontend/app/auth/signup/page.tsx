"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SignUpPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to signin page since we only use Google OAuth now
    router.replace("/auth/signin")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting to sign in...</p>
      </div>
    </div>
  )
}

