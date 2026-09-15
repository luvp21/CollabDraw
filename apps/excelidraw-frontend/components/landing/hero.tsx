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
  const ctaLabel = !isLoading && isAuthenticated ? "Go to dashboard" : "Start drawing — it's free"

  return (
    <section className="relative">
      <div className="relative container mx-auto px-4 pb-16 pt-16 lg:pb-24 lg:pt-24">
        <div className="max-w-2xl">
          <motion.h1
            className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-foreground lg:text-6xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Draw together.
            <br />
            Nothing gets lost.
          </motion.h1>

          <motion.div
            className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="max-w-md text-balance text-lg text-muted-foreground">
              Open a room, share the link, and sketch on an infinite canvas with anyone —
              every stroke saved the moment you draw it.
            </p>
          </motion.div>

          <motion.div
            className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href={ctaHref}>
              <Button size="lg" className="group px-6">
                {ctaLabel}
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>

            <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                  {h}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          className="relative mt-14 lg:mt-16"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <CanvasDemoPanel />
        </motion.div>
      </div>
    </section>
  )
}

function CanvasDemoPanel() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_2px_hsl(var(--foreground)/0.04),0_16px_40px_-16px_hsl(var(--foreground)/0.18)]">
      <div className="canvas-grid-texture relative aspect-[16/9] w-full sm:aspect-[21/9]">
        <svg viewBox="0 0 800 340" className="absolute inset-0 h-full w-full" aria-hidden>
          <motion.rect
            x="90" y="90" width="160" height="110" rx="6" fill="none"
            stroke="hsl(var(--primary))" strokeWidth="3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.6, ease: "easeInOut" }}
          />
          <motion.ellipse
            cx="470" cy="140" rx="85" ry="55" fill="none"
            stroke="hsl(199 89% 48%)" strokeWidth="3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.85, ease: "easeInOut" }}
          />
          <motion.path
            d="M 110 270 Q 170 220 230 270 T 350 270"
            fill="none" stroke="hsl(330 81% 60%)" strokeWidth="3" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 1.1, ease: "easeInOut" }}
          />
          <motion.line
            x1="560" y1="250" x2="700" y2="210"
            stroke="hsl(27 96% 61%)" strokeWidth="3" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.35, ease: "easeInOut" }}
          />
        </svg>

        <div className="absolute left-1/2 top-4 -translate-x-1/2 sm:top-6">
          <DemoToolbar />
        </div>
      </div>
    </div>
  )
}

const demoTools = [
  { d: "M4 4l7 15 2-7 7-2z" }, // select cursor
  { rect: true },
  { circle: true },
  { line: true },
]

function DemoToolbar() {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-border bg-card/95 p-1.5 shadow-[0_1px_2px_hsl(var(--foreground)/0.06),0_8px_20px_-8px_hsl(var(--foreground)/0.2)] backdrop-blur">
      {demoTools.map((tool, i) => (
        <div
          key={i}
          className={
            "flex h-7 w-7 items-center justify-center rounded-lg " +
            (i === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground")
          }
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            {tool.rect && <rect x="5" y="7" width="14" height="10" rx="1.5" />}
            {tool.circle && <circle cx="12" cy="12" r="6.5" />}
            {tool.line && <line x1="6" y1="17" x2="18" y2="7" strokeLinecap="round" />}
            {i === 0 && <path d={tool.d} strokeLinejoin="round" />}
          </svg>
        </div>
      ))}
    </div>
  )
}
