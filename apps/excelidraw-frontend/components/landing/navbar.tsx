"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { useAuth } from "@/providers/auth-provider"
import { Github } from "lucide-react"

export function Navbar() {
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <nav className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <Logo />
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="https://github.com/luvp21/CollabDraw"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="View source on GitHub"
          >
            <Github className="h-4 w-4" />
          </Link>

          {!isLoading && isAuthenticated ? (
            <Link href="/dashboard">
              <Button size="sm" className="ml-1">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/auth/signin">
              <Button size="sm" className="ml-1">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
