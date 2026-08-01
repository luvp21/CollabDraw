"use client"

import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Palette, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

// Room type
interface Room {
  id: number
  roomName: string
  createdAt?: string
  shapes?: unknown[]
}

// Props type
interface DashboardContentProps {
  rooms: Room[]
}

const ACCENTS = [
  "from-blue-500 to-cyan-400",
  "from-cyan-500 to-sky-400",
  "from-sky-500 to-blue-400",
  "from-blue-400 to-cyan-300",
]

export function DashboardContent({ rooms }: DashboardContentProps) {
  if (rooms.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 min-h-[70vh]">
        <div className="w-full max-w-md text-center rounded-2xl border-2 border-dashed border-blue-200 bg-white/60 p-10">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-blue-200">
            <Palette className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No rooms yet</h3>
          <p className="text-gray-600">Create your first room to start collaborating with others</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 container mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">Your Rooms</h2>
        <p className="text-gray-600">
          You have {rooms.length} room{rooms.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room, index) => {
          const accent = ACCENTS[index % ACCENTS.length]
          return (
            <Link
              key={room.id}
              href={`/room/${room.roomName}`}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100 hover:border-blue-200"
            >
              <div className={cn("h-1.5 w-full bg-gradient-to-r", accent)} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white",
                      accent,
                    )}
                  >
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <Users className="w-3 h-3" />
                    {room.shapes?.length || 0}
                  </Badge>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-1">{room.roomName}</h3>
                <p className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
                  <Calendar className="w-3.5 h-3.5" />
                  Created{" "}
                  {formatDistanceToNow(new Date(room.createdAt || Date.now()), {
                    addSuffix: true,
                  })}
                </p>

                <div className="flex items-center text-sm font-medium text-blue-500">
                  Open Room
                  <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
