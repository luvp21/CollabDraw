"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Chrome } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function SignInPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const googleAuthUrl = `${process.env.NEXT_PUBLIC_HTTP_URL || "http://localhost:3001"}/auth/google`

  const handleGoogleSignIn = () => {
    window.location.href = googleAuthUrl
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Welcome to CollabDraw</CardTitle>
            <CardDescription>Sign in with your Google account to start drawing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error === "no_token" ? "Authentication failed. Please try again." : "An error occurred. Please try again."}
              </div>
            )}
            <Button
              onClick={handleGoogleSignIn}
              className="w-full"
              size="lg"
            >
              <Chrome className="mr-2 h-5 w-5" />
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
