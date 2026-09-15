"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

interface RoomHeaderProps {
  roomName: string
}

export function RoomHeader({ roomName }: RoomHeaderProps) {
  return (
    <div className="absolute left-4 top-4 z-20">
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-center gap-1 rounded-lg border border-border bg-card/95 py-1 pl-1 pr-3 shadow-[0_1px_2px_hsl(var(--foreground)/0.04),0_8px_20px_-8px_hsl(var(--foreground)/0.2)] backdrop-blur-md"
      >
        <Link
          href="/dashboard"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          title="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="mx-1 h-5 w-px bg-border" />
        <span className="max-w-[12rem] truncate text-sm font-medium text-foreground">{roomName}</span>
        <span className="ml-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
      </motion.div>
    </div>
  )
}
