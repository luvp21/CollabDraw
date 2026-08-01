"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

interface RoomHeaderProps {
  roomName: string
}

export function RoomHeader({ roomName }: RoomHeaderProps) {
  return (
    <div className="absolute top-4 left-4 z-20">
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-center gap-1 bg-white/90 backdrop-blur rounded-lg shadow-lg shadow-black/5 border border-gray-200 pl-1 pr-3 py-1"
      >
        <Link
          href="/dashboard"
          className="flex items-center justify-center h-8 w-8 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          title="Back to dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="h-5 w-px bg-gray-200 mx-1" />
        <span className="text-sm font-medium text-gray-900 max-w-[12rem] truncate">{roomName}</span>
        <span className="flex items-center gap-1.5 ml-2 text-xs text-emerald-600 font-medium">
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
