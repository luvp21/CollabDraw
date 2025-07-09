"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Palette, ArrowRight } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

// Room type
interface Room {
  id: string
  roomName: string
  createdAt?: string
  shapes?: unknown[]
}

// Props type
interface DashboardContentProps {
  rooms: Room[]
}

export function DashboardContent({ rooms }: DashboardContentProps) {
  if (rooms.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Palette className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle>No rooms yet</CardTitle>
            <CardDescription>Create your first room to start collaborating with others</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Rooms</h2>
        <p className="text-gray-600">
          You have {rooms.length} room{rooms.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <Card key={room.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-1">{room.roomName}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Created{" "}
                    {formatDistanceToNow(new Date(room.createdAt || Date.now()), {
                      addSuffix: true,
                    })}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="ml-2">
                  <Users className="w-3 h-3 mr-1" />
                  {room.shapes?.length || 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href={`/room/${room.roomName}`}>
                <Button className="w-full group">
                  Open Room
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}