"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"
import { Github, PenTool } from "lucide-react"

export function Navbar() {
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <nav className="sticky top-0 z-30 bg-white/30 backdrop-blur-lg supports-[backdrop-filter]:bg-white/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-sm shadow-blue-300 transition-transform group-hover:scale-105">
            <PenTool className="w-4 h-4" />
          </span>
          <span className="font-bold text-lg text-gray-900 tracking-tight">CollabDraw</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="https://github.com/luvp21/CollabDraw"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center justify-center h-9 w-9 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5" />
          </Link>

          {!isLoading && isAuthenticated ? (
            <Link href="/dashboard">
              <Button className="bg-blue-500 hover:bg-blue-600">Dashboard</Button>
            </Link>
          ) : (
            <Link href="/auth/signin">
              <Button className="bg-blue-500 hover:bg-blue-600">Get Started</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
