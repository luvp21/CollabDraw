"use client"

import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import { Logo } from "@/components/logo"
import Link from "next/link"

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3.02c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.12A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.6H1.26a12 12 0 0 0 0 10.79l4.01-3.12Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.26 6.6l4.01 3.13C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  )
}

function SignInContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const googleAuthUrl = `${process.env.NEXT_PUBLIC_HTTP_URL || "http://localhost:3001"}/auth/google`

  const handleGoogleSignIn = () => {
    window.location.href = googleAuthUrl
  }

  return (
    <div className="w-full max-w-[380px]">
      <Link href="/" className="mb-8 flex justify-center">
        <Logo />
      </Link>

      <Card className="border-border shadow-[0_1px_2px_hsl(var(--foreground)/0.04),0_16px_40px_-16px_hsl(var(--foreground)/0.16)]">
        <CardHeader className="space-y-1.5 text-center">
          <CardTitle className="text-xl font-semibold">Sign in</CardTitle>
          <CardDescription>Continue with Google to start drawing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error === "no_token" ? "Authentication failed. Please try again." : "An error occurred. Please try again."}
            </div>
          )}
          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full gap-2.5 border-border font-medium"
            size="lg"
          >
            <GoogleIcon />
            Continue with Google
          </Button>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        CollabDraw is free — no card, no plan, just a room and a link.
      </p>
    </div>
  )
}

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <div
        aria-hidden
        className="canvas-grid-texture absolute inset-0 [mask-image:radial-gradient(ellipse_55%_50%_at_center,black,transparent)]"
      />
      <div className="relative">
        <Suspense fallback={<div className="w-full max-w-[380px]" />}>
          <SignInContent />
        </Suspense>
      </div>
    </div>
  )
}
