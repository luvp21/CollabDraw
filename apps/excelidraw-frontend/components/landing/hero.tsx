"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "@/providers/auth-provider"

const highlights = ["Full drawing toolset", "Instant multiplayer sync", "Infinite pan & zoom canvas"]

export function Hero() {
  const { isAuthenticated, isLoading } = useAuth()
  const ctaHref = !isLoading && isAuthenticated ? "/dashboard" : "/auth/signin"
  const ctaLabel = !isLoading && isAuthenticated ? "Go to Dashboard" : "Start Drawing — It's Free"

  return (
    <section className="relative">
      <div className="relative container mx-auto px-4 py-20 lg:py-28">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            className="inline-flex items-center gap-2 mb-6 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1.5 text-sm font-medium text-blue-700 backdrop-blur"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>
            Live now — draw with anyone, instantly
          </motion.div>

          <motion.h1
            className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 text-balance tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            A shared whiteboard for{" "}
            <span className="animate-gradient-text bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              real-time
            </span>{" "}
            thinking
          </motion.h1>

          <motion.p
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Create a room, share the link, and sketch together on an infinite canvas.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link href={ctaHref}>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  className="text-lg px-8 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-300/50 border-0"
                >
                  {ctaLabel}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-14 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.55 }}
          >
            {highlights.map((h) => (
              <span key={h} className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-blue-400" />
                {h}
              </span>
            ))}
          </motion.div>

          <motion.div
            className="relative mx-auto max-w-3xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            <motion.div
              className="animate-float rounded-2xl border border-gray-200/80 bg-white/90 backdrop-blur shadow-2xl shadow-blue-200/40 overflow-hidden"
              whileHover={{ scale: 1.015 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <div className="h-9 flex items-center gap-1.5 px-4 border-b border-gray-100 bg-gray-50/80">
                <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-300" />
              </div>
              <svg viewBox="0 0 600 300" className="w-full h-auto bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:24px_24px]">
                <motion.rect
                  x="60" y="60" width="140" height="90" rx="4" fill="none" stroke="#3b82f6" strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 0.9, ease: "easeInOut" }}
                />
                <motion.ellipse
                  cx="420" cy="105" rx="70" ry="45" fill="none" stroke="#06b6d4" strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 1.2, ease: "easeInOut" }}
                />
                <motion.path
                  d="M 90 220 Q 150 170 210 220 T 330 220"
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, delay: 1.5, ease: "easeInOut" }}
                />
                <motion.line
                  x1="380" y1="230" x2="520" y2="190" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 1.9, ease: "easeInOut" }}
                />
              </svg>
            </motion.div>
          </motion.div>

          <motion.p
            className="mt-10 text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Made by{" "}
            <a
              href="https://luvvv.me"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-500 hover:text-blue-600 transition-colors"
            >
              luvvv.me
            </a>
          </motion.p>
        </div>
      </div>
    </section>
  )
}
