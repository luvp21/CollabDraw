"use client"

import { ChevronRight, Palette } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface Room {
  id: number
  roomName: string
  createdAt?: string
  _count?: { shape: number }
}

interface DashboardContentProps {
  rooms: Room[]
  userName?: string
}

export function DashboardContent({ rooms, userName }: DashboardContentProps) {
  const firstName = userName?.split(" ")[0]

  if (rooms.length === 0) {
    return (
      <div className="container mx-auto px-6 py-10">
        <PageHeading firstName={firstName} count={0} />
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed border-border p-10 text-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
            <Palette className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-base font-medium text-foreground">No rooms yet</h3>
          <p className="max-w-xs text-sm text-muted-foreground">
            Create a room to start collaborating, or join one with a link someone shared with you.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <PageHeading firstName={firstName} count={rooms.length} />

      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {rooms.map((room) => (
          <Link
            key={room.id}
            href={`/room/${room.roomName}`}
            className="group flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-secondary/60"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                <Palette className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{room.roomName}</p>
                <p className="text-xs text-muted-foreground">
                  {room._count?.shape ?? 0} shape{room._count?.shape === 1 ? "" : "s"} · created{" "}
                  {formatDistanceToNow(new Date(room.createdAt || Date.now()), { addSuffix: true })}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
          </Link>
        ))}
      </div>
    </div>
  )
}

function PageHeading({ firstName, count }: { firstName?: string; count: number }) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        {firstName ? `${firstName}'s rooms` : "Your rooms"}
      </h1>
      <p className="text-sm text-muted-foreground">
        {count === 0 ? "Nothing here yet" : `${count} room${count === 1 ? "" : "s"}`}
      </p>
    </div>
  )
}
